import Logo from '../Logo'
import React from 'react'
import useHttpLocations from '../../hooks/useHttpLocations'

export default function ListLogo({
  logoURI,
  style,
  size = '24px',
  alt,
}: {
  logoURI: string
  size?: string
  style?: React.CSSProperties
  alt?: string
}) {
  return <Logo alt={alt} width={size} height={size} style={style} />
}
