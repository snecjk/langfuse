import { type Messages } from "../messages";

export const dashboardMessages = {
  en: {
    dashboards: "Dashboards",
    dashboard: "Dashboard",
    dashboardImported: "Dashboard imported",
    home: "Home",
    tracingSetup: "Tracing Setup",
    createDashboard: "Create Dashboard",
    newDashboard: "New dashboard",
    manageCreateDashboards: "Manage and create dashboards for your project.",
    cancel: "Cancel",
    dashboardName: "Dashboard Name",
    dashboardNamePlaceholder: "Enter dashboard name",
    dashboardNameRequired: "Dashboard name is required",
    dashboardDescriptionPlaceholder:
      "Describe the purpose of this dashboard. Optional, but very helpful.",
    description: "Description",
    errorCreateDashboard: "Error creating dashboard",
    dashboardCreated: "Dashboard created",
    dashboardCreatedDescription:
      "Your new dashboard has been created successfully",
  },
  "zh-CN": {
    dashboards: "仪表盘",
    dashboard: "仪表盘",
    dashboardImported: "仪表盘已导入",
    home: "首页",
    tracingSetup: "追踪设置",
    createDashboard: "创建仪表盘",
    newDashboard: "新建仪表盘",
    manageCreateDashboards: "管理和创建项目的仪表盘。",
    cancel: "取消",
    dashboardName: "仪表盘名称",
    dashboardNamePlaceholder: "输入仪表盘名称",
    dashboardNameRequired: "仪表盘名称为必填项",
    dashboardDescriptionPlaceholder: "描述此仪表盘的用途（可选，但很有帮助）。",
    description: "描述",
    errorCreateDashboard: "创建仪表盘失败",
    dashboardCreated: "仪表盘已创建",
    dashboardCreatedDescription: "新仪表盘已成功创建",
  },
} satisfies Messages;
