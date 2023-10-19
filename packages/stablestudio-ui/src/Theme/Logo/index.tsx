import { Next } from "./Next";

export function Logo(props: JSX.IntrinsicElements["img"]) {
  return <img src="/logo.ico" alt="Logo" {...props} style={{width: '40px', height: '40px'}}/>;
}

Logo.Next = Next;
