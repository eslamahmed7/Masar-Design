import gsap from 'gsap'

/**
 * Apply hover magnetic effect to a button element
 */
export const applyMagneticButton = (element: HTMLElement) => {
  let magneticX = 0
  let magneticY = 0

  const handleMouseMove = (e: MouseEvent) => {
    const { left, top, width, height } = element.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2

    const distX = e.clientX - centerX
    const distY = e.clientY - centerY
    const distance = Math.sqrt(distX * distX + distY * distY)

    // Magnetic pull range
    if (distance < 100) {
      magneticX = distX * 0.3
      magneticY = distY * 0.3

      gsap.to(element, {
        x: magneticX,
        y: magneticY,
        duration: 0.3,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }
  }

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'elastic.out(1, 0.5)',
    })
  }

  element.addEventListener('mousemove', handleMouseMove)
  element.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    element.removeEventListener('mousemove', handleMouseMove)
    element.removeEventListener('mouseleave', handleMouseLeave)
  }
}

/**
 * Apply lift and glow effect to a card element
 */
export const applyCardLift = (element: HTMLElement) => {
  const handleMouseEnter = () => {
    gsap.to(element, {
      y: -10,
      boxShadow: '0 20px 40px rgba(212, 175, 110, 0.2)',
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(element, {
      y: 0,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  element.addEventListener('mouseenter', handleMouseEnter)
  element.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter)
    element.removeEventListener('mouseleave', handleMouseLeave)
  }
}

/**
 * Apply zoom effect to an image element
 */
export const applyImageZoom = (element: HTMLElement) => {
  const handleMouseEnter = () => {
    gsap.to(element, {
      scale: 1.05,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(element, {
      scale: 1,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  element.addEventListener('mouseenter', handleMouseEnter)
  element.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter)
    element.removeEventListener('mouseleave', handleMouseLeave)
  }
}

/**
 * Apply animated underline effect to a link
 */
export const applyLinkUnderline = (element: HTMLElement) => {
  const underline = document.createElement('span')
  underline.style.position = 'absolute'
  underline.style.bottom = '0'
  underline.style.left = '0'
  underline.style.width = '100%'
  underline.style.height = '2px'
  underline.style.background = 'var(--gold)'
  underline.style.transform = 'scaleX(0)'
  underline.style.transformOrigin = 'right'
  underline.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'

  element.style.position = 'relative'
  element.appendChild(underline)

  const handleMouseEnter = () => {
    underline.style.transform = 'scaleX(1)'
    underline.style.transformOrigin = 'left'
  }

  const handleMouseLeave = () => {
    underline.style.transform = 'scaleX(0)'
    underline.style.transformOrigin = 'right'
  }

  element.addEventListener('mouseenter', handleMouseEnter)
  element.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter)
    element.removeEventListener('mouseleave', handleMouseLeave)
  }
}

/**
 * Apply small rotation effect to an icon
 */
export const applyIconRotation = (element: HTMLElement) => {
  const handleMouseEnter = () => {
    gsap.to(element, {
      rotation: 360,
      duration: 0.6,
      ease: 'back.out(1.7)',
    })
  }

  element.addEventListener('mouseenter', handleMouseEnter)

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter)
  }
}

/**
 * Apply fade in animation to an element
 */
export const applyFadeInOnScroll = (element: HTMLElement) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        })
        observer.unobserve(element)
      }
    },
    {
      threshold: 0.1,
    }
  )

  gsap.set(element, {
    opacity: 0,
    y: 20,
  })

  observer.observe(element)

  return () => {
    observer.unobserve(element)
  }
}

/**
 * Apply stagger animation to child elements
 */
export const applyStaggerAnimation = (
  element: HTMLElement,
  selector: string,
  duration = 0.6
) => {
  const children = element.querySelectorAll(selector)

  gsap.from(children, {
    opacity: 0,
    y: 30,
    duration,
    stagger: 0.1,
    ease: 'power2.out',
  })

  return () => {
    // Cleanup if needed
  }
}
