---
title: WebSocket 완벽 정리 — Spring Boot + React로 실시간 통신 구현하기
date: 2026-05-04
summary: WebSocket의 동작 원리부터 Spring Boot(STOMP) 서버 구현, React + TypeScript 클라이언트 연동까지 실전 예제로 한 번에 정리합니다.
tags: [WebSocket, STOMP, Spring Boot, React, TypeScript, 실시간통신]
---

WebSocket은 단일 TCP 연결 위에서 **전이중(full-duplex)** 통신을 제공하는 프로토콜입니다. HTTP의 요청-응답 모델과 달리 서버가 클라이언트에게 먼저 데이터를 보낼 수 있어, 채팅·알림·실시간 대시보드 같은 기능에 필수적입니다.

> 목표: WebSocket의 핸드셰이크 원리를 이해하고, Spring Boot + STOMP 서버와 React + TypeScript 클라이언트를 직접 구현해 실시간 채팅을 완성한다.

## 목차

1. [HTTP vs WebSocket — 무엇이 다른가](#1-http-vs-websocket--무엇이-다른가)
2. [WebSocket 핸드셰이크 동작 원리](#2-websocket-핸드셰이크-동작-원리)
3. [STOMP — 메시지 레이어 프로토콜](#3-stomp--메시지-레이어-프로토콜)
4. [Spring Boot 서버 구현](#4-spring-boot-서버-구현)
5. [React + TypeScript 클라이언트 구현](#5-react--typescript-클라이언트-구현)
6. [JPA로 메시지 영속화](#6-jpa로-메시지-영속화)
7. [보안 — JWT 인증 연동](#7-보안--jwt-인증-연동)
8. [실무 트러블슈팅 & 팁](#8-실무-트러블슈팅--팁)

---

## 1. HTTP vs WebSocket — 무엇이 다른가

| 구분 | HTTP | WebSocket |
|------|------|-----------|
| 연결 방식 | 요청마다 새 연결 (HTTP/1.1은 Keep-Alive) | 연결 한 번 → 유지 |
| 통신 방향 | 단방향 (클라이언트 → 서버) | **양방향** |
| 서버 Push | 불가 (SSE로 우회 가능) | 가능 |
| 오버헤드 | 매 요청마다 헤더 전송 | 초기 핸드셰이크 이후 최소 헤더 |
| 적합한 상황 | REST API, 페이지 로드 | 채팅, 알림, 게임, 주식 시세 |

**Polling / Long-Polling / SSE와의 차이**

- **Polling**: 클라이언트가 주기적으로 GET 요청 → 낭비가 심함
- **Long-Polling**: 서버가 응답을 지연시켜 이벤트 발생 시 응답 → 연결 반복 비용
- **SSE**: 서버 → 클라이언트 단방향 스트림 → 단순 알림에는 충분하지만 양방향 불가
- **WebSocket**: 양방향, 저지연, 연결 유지 → 실시간 인터랙션에 최적

---

## 2. WebSocket 핸드셰이크 동작 원리

WebSocket은 HTTP Upgrade 메커니즘으로 시작합니다.

```
클라이언트 → 서버
GET /ws HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

서버 → 클라이언트
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

`101 Switching Protocols` 응답 이후 TCP 연결은 WebSocket 프레임 교환 채널로 전환됩니다. 이 시점부터 HTTP 헤더는 더 이상 오가지 않습니다.

---

## 3. STOMP — 메시지 레이어 프로토콜

순수 WebSocket은 바이트 스트림만 제공합니다. **STOMP(Simple Text Oriented Messaging Protocol)** 는 그 위에 구독/발행 모델과 목적지(destination) 라우팅을 추가합니다.

```
SEND
destination:/app/chat
content-type:application/json

{"roomId":1,"content":"안녕하세요"}
^@

SUBSCRIBE
id:sub-0
destination:/topic/room/1

^@
```

Spring에서는 `@MessageMapping`, `@SendTo` 어노테이션으로 STOMP 메시지를 라우팅합니다.

---

## 4. Spring Boot 서버 구현

### 의존성 추가 (`build.gradle`)

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-websocket'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'io.jsonwebtoken:jjwt-api:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.5'
    runtimeOnly 'com.h2database:h2' // 개발용, 운영은 PostgreSQL
}
```

### WebSocket 설정

```java
// WebSocketConfig.java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트가 구독할 prefix — 서버가 메시지를 브로드캐스트하는 주소
        registry.enableSimpleBroker("/topic", "/queue");
        // 클라이언트 → 서버 메시지 prefix
        registry.setApplicationDestinationPrefixes("/app");
        // 특정 유저에게만 보낼 때 사용하는 prefix
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // SockJS fallback (WebSocket 미지원 환경 대응)
    }
}
```

### 채팅 컨트롤러

```java
// ChatController.java
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    // /app/chat.send 로 수신 → /topic/room/{roomId} 로 브로드캐스트
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request,
                            SimpMessageHeaderAccessor headerAccessor) {
        String sender = (String) headerAccessor.getSessionAttributes().get("username");
        ChatMessageResponse saved = chatMessageService.save(request, sender);
        messagingTemplate.convertAndSend(
            "/topic/room/" + request.getRoomId(), saved
        );
    }

    // 입장 이벤트
    @MessageMapping("/chat.join")
    public void joinRoom(@Payload JoinRequest request,
                         SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", request.getUsername());
        messagingTemplate.convertAndSend(
            "/topic/room/" + request.getRoomId(),
            SystemMessage.of(request.getUsername() + "님이 입장했습니다.")
        );
    }
}
```

### DTO

```java
// ChatMessageRequest.java
public record ChatMessageRequest(
    Long roomId,
    String content
) {}

// ChatMessageResponse.java
public record ChatMessageResponse(
    Long id,
    String sender,
    String content,
    LocalDateTime createdAt
) {}
```

---

## 5. React + TypeScript 클라이언트 구현

### 패키지 설치

```bash
npm install @stomp/stompjs sockjs-client
npm install -D @types/sockjs-client
```

### WebSocket 훅 — `useChat.ts`

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  createdAt: string;
}

interface UseChatOptions {
  roomId: number;
  username: string;
}

export const useChat = ({ roomId, username }: UseChatOptions) => {
  const clientRef = useRef<Client | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true);

        // 채팅방 구독
        client.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
          const body: ChatMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, body]);
        });

        // 입장 알림 전송
        client.publish({
          destination: '/app/chat.join',
          body: JSON.stringify({ roomId, username }),
        });
      },

      onDisconnect: () => setConnected(false),
      onStompError: frame => console.error('STOMP error', frame),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [roomId, username]);

  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current?.connected) return;
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ roomId, content }),
    });
  }, [roomId]);

  return { messages, sendMessage, connected };
};
```

### 채팅 컴포넌트 — `ChatRoom.tsx`

```tsx
import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

interface Props {
  roomId: number;
  username: string;
}

export const ChatRoom = ({ roomId, username }: Props) => {
  const { messages, sendMessage, connected } = useChat({ roomId, username });
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지 도착 시 스크롤 이동
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !connected) return;
    sendMessage(trimmed);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      <header className="p-4 bg-gray-800 text-white flex justify-between">
        <span>채팅방 #{roomId}</span>
        <span className={connected ? 'text-green-400' : 'text-red-400'}>
          {connected ? '● 연결됨' : '○ 연결 중...'}
        </span>
      </header>

      <ul className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-900">
        {messages.map((msg, i) => (
          <li key={msg.id ?? i}
              className={`flex flex-col ${msg.sender === username ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-400 mb-1">{msg.sender}</span>
            <span className={`px-3 py-2 rounded-lg text-sm max-w-xs break-words
              ${msg.sender === username
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-100'}`}>
              {msg.content}
            </span>
          </li>
        ))}
        <div ref={bottomRef} />
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-gray-800">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="메시지 입력..."
          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white outline-none"
        />
        <button type="submit" disabled={!connected}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          전송
        </button>
      </form>
    </div>
  );
};
```

---

## 6. JPA로 메시지 영속화

```java
// ChatMessage.java (Entity)
@Entity
@Table(name = "chat_messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long roomId;

    @Column(nullable = false)
    private String sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public static ChatMessage of(Long roomId, String sender, String content) {
        ChatMessage msg = new ChatMessage();
        msg.roomId = roomId;
        msg.sender = sender;
        msg.content = content;
        return msg;
    }
}
```

```java
// ChatMessageRepository.java
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findTop50ByRoomIdOrderByCreatedAtAsc(Long roomId);
}
```

```java
// ChatMessageService.java
@Service
@RequiredArgsConstructor
@Transactional
public class ChatMessageService {

    private final ChatMessageRepository repository;

    public ChatMessageResponse save(ChatMessageRequest request, String sender) {
        ChatMessage saved = repository.save(
            ChatMessage.of(request.roomId(), sender, request.content())
        );
        return new ChatMessageResponse(
            saved.getId(), saved.getSender(),
            saved.getContent(), saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getHistory(Long roomId) {
        return repository.findTop50ByRoomIdOrderByCreatedAtAsc(roomId)
            .stream()
            .map(m -> new ChatMessageResponse(
                m.getId(), m.getSender(), m.getContent(), m.getCreatedAt()))
            .toList();
    }
}
```

React 클라이언트에서 입장 시 이전 메시지를 불러오는 REST 호출을 추가합니다.

```typescript
// useChat.ts — onConnect 콜백 안에서 히스토리 로드
const history = await fetch(`/api/rooms/${roomId}/messages`).then(r => r.json());
setMessages(history);
```

---

## 7. 보안 — JWT 인증 연동

STOMP 연결 시 `Authorization` 헤더로 JWT를 전달합니다.

```typescript
// 클라이언트 — 토큰 전달
const client = new Client({
  webSocketFactory: () => new SockJS('/ws'),
  connectHeaders: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
  // ...
});
```

```java
// ChannelInterceptor — 서버에서 토큰 검증
@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
            MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                Authentication auth = jwtTokenProvider.getAuthentication(jwt);
                accessor.setUser(auth);
            }
        }
        return message;
    }
}
```

```java
// WebSocketConfig — 인터셉터 등록
@Override
public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(jwtChannelInterceptor);
}
```

---

## 8. 실무 트러블슈팅 & 팁

### CORS 설정

```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOrigins("http://localhost:5173", "https://yourdomain.com")
            .withSockJS();
}
```

### 연결 끊김 처리 (클라이언트)

```typescript
const client = new Client({
  reconnectDelay: 5000, // 5초 후 자동 재연결
  onDisconnect: () => {
    console.warn('WebSocket 연결 끊김 — 재연결 시도 중...');
  },
});
```

### 메시지 유실 방지

- **재연결 후 마지막 메시지 ID 기반 히스토리 재요청**: 재연결 시 `onConnect`에서 마지막으로 받은 `id` 이후 메시지를 REST로 가져온 뒤 구독 재개
- **운영 환경에는 Redis Pub/Sub 도입**: `SimpleBroker`는 인메모리이므로 다중 인스턴스 환경에선 `RabbitMQ` 또는 `Redis` 외부 브로커 사용

### SockJS vs 순수 WebSocket

| | SockJS | 순수 WebSocket |
|--|--------|----------------|
| 브라우저 지원 | IE 포함 레거시 대응 | 모던 브라우저 only |
| Fallback | HTTP Streaming, XHR-Polling | 없음 |
| 프록시 통과 | 용이 | HTTPS 필수 시 주의 |

### 성능 고려사항

- 대규모 브로드캐스트 시 **RabbitMQ STOMP plugin** 또는 **Redis Stream** 도입 검토
- 메시지 페이로드는 가능한 가볍게 유지 (불필요한 필드 제거)
- 연결 수가 많아지면 **Netty 기반 비동기 서버**(Spring WebFlux + rsocket) 고려
