import { expect, fn, userEvent, within } from "storybook/test";

import preview from "@/.storybook/preview";
import { I18nProvider } from "@/src/features/i18n/I18nProvider";
import { DialogController } from "@/src/components/design-system/DialogController/DialogController";
import {
  DeleteProjectDialog,
  type DeleteProjectDialogProps,
} from "./DeleteProjectDialog";

const meta = preview.meta({
  component: DeleteProjectDialog,
});

export default meta;

const renderDialog = (args: DeleteProjectDialogProps) => (
  <DialogController
    initialState={() => true}
    renderDialog={() => <DeleteProjectDialog {...args} />}
  >
    {() => null}
  </DialogController>
);

export const Default = meta.story({
  args: {
    confirmMessage: "acme/my-project",
    isPending: false,
    onSubmit: fn(),
  },
  render: renderDialog,
});

export const GatewayIngestionProject = meta.story({
  args: {
    confirmMessage: "acme/gateway-traces",
    isPending: false,
    onSubmit: fn(),
    gatewayOrganizationName: "Acme",
  },
  render: renderDialog,
});

export const ConfirmsDeletion = meta.story({
  name: "(Test) Confirms deletion",
  args: {
    confirmMessage: "acme/my-project",
    isPending: false,
    onSubmit: fn(),
  },
  render: (args) => (
    <I18nProvider initialLocale="zh-CN">{renderDialog(args)}</I18nProvider>
  ),
  play: async ({ args, canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.type(
      body.getByPlaceholderText("acme/my-project"),
      "acme/my-project",
    );
    await expect(body.getByRole("dialog", { name: "删除项目" })).toBeVisible();
    await expect(body.getByPlaceholderText("acme/my-project")).toHaveValue(
      "acme/my-project",
    );
    await userEvent.click(body.getByRole("button", { name: "删除项目" }));

    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
});
