"use client";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditorProvider,
  RichTextField,
  MenuButtonStrikethrough,
  MenuButtonOrderedList,
  MenuButtonBulletedList,
  MenuButtonBlockquote,
  MenuButtonCode,
  MenuButtonHorizontalRule,
  MenuButtonUndo,
  MenuButtonRedo,
  MenuButtonRemoveFormatting,
} from "mui-tiptap";
import { useEffect } from "react";
import "./Tiptap.css";

interface TiptapEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

const TiptapEditor = ({ value = "", onChange, placeholder = "Ketik konten di sini..." }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || `<p>${placeholder}</p>`,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  return (
    <RichTextEditorProvider editor={editor}>
      <RichTextField
        controls={
          <MenuControlsContainer>
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonStrikethrough />
            <MenuDivider />
            <MenuButtonOrderedList />
            <MenuButtonBulletedList />
            <MenuDivider />
            <MenuButtonBlockquote />
            <MenuButtonCode />
            <MenuButtonHorizontalRule />
            <MenuDivider />
            <MenuButtonUndo />
            <MenuButtonRedo />
            <MenuDivider />
            <MenuButtonRemoveFormatting />
          </MenuControlsContainer>
        }
      />
    </RichTextEditorProvider>
  );
};

export default TiptapEditor;
