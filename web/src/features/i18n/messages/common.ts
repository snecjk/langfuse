import { type Messages } from "../messages";

export const commonMessages = {
  en: {
    loading: "Loading",
    redirecting: "Redirecting",
    projectNotFound: "Project Not Found",
    projectUnavailable:
      "The project you are trying to access does not exist or you do not have access to it.",
    goHome: "Go to Home",
    language: "Language",
    languageDescription: "Choose the interface language for this browser",
    // PasswordInput
    showPassword: "Show password",
    hidePassword: "Hide password",
    // Dropzone
    dropzoneAttachFiles: "Attach files",
    dropzoneUploadOne: "Upload a file",
    dropzoneUploadMany: "Upload {count} files",
    dropzoneDragDropUpload: "Drag and drop or click to upload",
    dropzoneDragDropReplace: "Drag and drop or click to replace",
    dropzoneAccepts: "Accepts {types}",
    dropzoneFileCount: {
      one: "{count} file • {size} MB",
      other: "{count} files • {size} MB",
    },
    dropzoneMoreFiles: "and {count} more",
  },
  "zh-CN": {
    loading: "加载中",
    redirecting: "正在跳转",
    projectNotFound: "未找到项目",
    projectUnavailable: "你尝试访问的项目不存在，或你没有访问权限。",
    goHome: "返回首页",
    language: "语言",
    languageDescription: "选择此浏览器的界面语言",
    // PasswordInput
    showPassword: "显示密码",
    hidePassword: "隐藏密码",
    // Dropzone
    dropzoneAttachFiles: "附加文件",
    dropzoneUploadOne: "上传文件",
    dropzoneUploadMany: "上传 {count} 个文件",
    dropzoneDragDropUpload: "拖拽或点击上传",
    dropzoneDragDropReplace: "拖拽或点击替换",
    dropzoneAccepts: "接受 {types}",
    dropzoneFileCount: {
      one: "{count} 个文件 • {size} MB",
      other: "{count} 个文件 • {size} MB",
    },
    dropzoneMoreFiles: "另外 {count} 个",
  },
} satisfies Messages;
