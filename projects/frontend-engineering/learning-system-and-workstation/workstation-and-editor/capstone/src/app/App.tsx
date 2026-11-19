import { ErrorBoundary } from './ErrorBoundary';
import { ConfiguratorForm } from '../features/configurator/components/ConfiguratorForm';
import type { ConfiguratorServices } from '../features/configurator/hooks/useConfigurator';
import type { Logger } from '../shared/lib/Logger';

interface AppProps {
  services: ConfiguratorServices;
  title: string;
  logger: Logger;
}

export function App({ services, title, logger }: AppProps) {
  return (
    <ErrorBoundary logger={logger}>
      <ConfiguratorForm services={services} title={title} logger={logger} />
    </ErrorBoundary>
  );
}
