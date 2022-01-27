import React, { FC, useState } from 'react'

import { IconProps } from 'react-feather'
import Image from '../Image'
import { classNames } from '../../functions'
import { cloudinaryLoader } from '../../functions/cloudinary'

const BAD_SRCS: { [tokenAddress: string]: true } = {}

export type LogoProps = {
  width: string | number
  height: string | number
  alt?: string
} & IconProps

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
const Logo: FC<LogoProps> = ({ width, height, style, alt = '', className, ...rest }) => {
  return (
    <div className="rounded" style={{ width, height, ...style }}>
      <Image
        src={
          `/images/icons/${alt.toLocaleLowerCase()}.png` ||
          'https://raw.githubusercontent.com/sushiswap/icons/master/token/unknown.png'
        }
        width={width}
        height={height}
        alt={alt}
        layout="fixed"
        className={classNames('rounded', className)}
        {...rest}
      />
    </div>
  )
}

export default Logo
