import "@toast-ui/editor/dist/toastui-editor.css";
import {Editor} from "@toast-ui/react-editor";

export const ToastUI = () => {
    return (
        <Editor
            initialValue="Hello Toast UI Editor!"
            previewStyle="vertical"
            height="600px"
            initialEditType="markdown"
            useCommandShortcut={true}
        />
    );
};
