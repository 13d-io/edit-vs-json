import { FunctionComponent, PropsWithChildren } from 'react';

interface IToggle {
  onClick: () => void;
  active: boolean;
}

export const Toggle: FunctionComponent<PropsWithChildren<IToggle>> = ({
  active,
  onClick,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className={`toggle ${active ? 'on' : 'off' }`}
    >
      {children}
    </button>
  );
};
