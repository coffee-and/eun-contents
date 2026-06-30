import {
  CONTENT_REGISTRY,
  CONTENT_STATUS,
  getContentByRoute,
} from "../app/contentRegistry.jsx";

export { CONTENT_STATUS, getContentByRoute };

export const CONTENT_CATALOG = CONTENT_REGISTRY.map(
  ({ component, themeClass, ...content }) => content
);
