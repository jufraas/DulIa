import { motion, useReducedMotion } from 'framer-motion'

/** Misma curva que --ease-out del kit DulIA */
const EASE_OUT = [0.16, 1, 0.3, 1]

const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
}

/**
 * @param {{
 *   children: import('react').ReactNode,
 *   as?: 'div' | 'section' | 'article' | 'header',
 *   className?: string,
 *   style?: import('react').CSSProperties,
 *   delay?: number,
 *   y?: number,
 *   duration?: number,
 *   trigger?: 'scroll' | 'mount',
 *   enter?: boolean,
 * }} props
 */
export default function RevealOnScroll({
  children,
  as = 'div',
  className = '',
  style,
  delay = 0,
  y = 20,
  duration = 0.5,
  trigger = 'scroll',
  enter = true,
}) {
  const reduceMotion = useReducedMotion()
  const Component = MOTION_TAGS[as] ?? motion.div

  if (reduceMotion) {
    const Tag = as
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    )
  }

  if (trigger === 'mount') {
    return (
      <Component
        className={className}
        style={style}
        initial={{ opacity: 0, y }}
        animate={enter ? { opacity: 1, y: 0 } : { opacity: 0, y }}
        transition={{ duration, ease: EASE_OUT, delay }}
      >
        {children}
      </Component>
    )
  }

  return (
    <Component
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -56px 0px' }}
      transition={{ duration, ease: EASE_OUT, delay }}
    >
      {children}
    </Component>
  )
}
