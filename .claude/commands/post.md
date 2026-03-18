Create a new blog post markdown file in `src/content/posts/`.

## Instructions

The user will provide a topic or title (via `$ARGUMENTS`). If no argument is given, ask what topic to write about.

### Steps

1. **Determine the filename**
   - Format: `YYYY-MM-DD-{제목}.md` (use today's date)
   - Example: `2026-03-18-React 최적화 정리.md`

2. **Generate rich content** for the topic — structured, educational, in Korean (unless the topic is English-centric).
   Write thorough content with:
   - Intro paragraph explaining the topic
   - A `> 목표:` blockquote
   - Table of contents (numbered list with anchor links)
   - Each section as `## N. 섹션명` with explanations, code blocks, tables, or bullet lists as needed
   - Practical examples and tips

3. **Frontmatter** must follow this exact format:
   ```
   ---
   title: {제목}
   date: {YYYY-MM-DD}
   summary: {2-3줄 핵심 요약}
   tags: [{관련 태그들, 콤마로 구분}]
   ---
   ```

4. **Write the file** to `src/content/posts/{filename}`.

5. **Confirm** by showing the file path and the first 10 lines to the user.

Topic: $ARGUMENTS
