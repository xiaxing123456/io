import pltCommonComponents from './components';
import './styles/index.scss';

const platformUIComponents = [...pltCommonComponents];

export { platformUIComponents };
export * from './components';
export { PltLoading } from './components/plt-loading';
export type {
  LoadingInstance,
  LoadingOptions,
  LoadingParentElement,
  LoadingTarget,
} from './components/plt-loading';
