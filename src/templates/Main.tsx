import { ReactNode } from 'react';

import useEagerConnect from '@/hooks/useEagerConnect';

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
};

const Main = (props: IMainProps) => {
  useEagerConnect();
  return (
    <div>
      {props.meta}
      <div>{props.children}</div>
    </div>
  );
};
export { Main };
