import { envVariables } from '@admin-web/utils/env-var';
import { CreatePlatformHttp } from '@admin-web/utils/request/common/http';

const createPlatformHttp = new CreatePlatformHttp({
  baseURL: envVariables.baseUrl,
  timeout: 10000,
});

export default createPlatformHttp.instance;
