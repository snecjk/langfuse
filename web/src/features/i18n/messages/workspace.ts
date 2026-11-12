import { type Messages } from "../messages";

export const workspaceMessages = {
  en: {
    organizations: "Organizations",
    projects: "Projects",
    new: "New",
    newOrganization: "New organization",
    newProject: "New project",
    searchOrganizations: "Search organizations...",
    searchProjects: "Search projects...",
    noOrganizations: "No organization found.",
    noProjects: "No project found.",
    settingsFor: "Go to settings for {name}",
  },
  "zh-CN": {
    organizations: "组织",
    projects: "项目",
    new: "新建",
    newOrganization: "新建组织",
    newProject: "新建项目",
    searchOrganizations: "搜索组织…",
    searchProjects: "搜索项目…",
    noOrganizations: "未找到组织。",
    noProjects: "未找到项目。",
    settingsFor: "打开 {name} 的设置",
  },
} satisfies Messages;
