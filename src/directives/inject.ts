import {ViewContext} from "ui-router-core";

/** @internalapi These are provide()d as the string UIView.PARENT_INJECT */
export interface ParentUIViewInject {
  context: ViewContext;
  fqn: string;
}
