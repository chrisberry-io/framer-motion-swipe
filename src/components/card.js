import React, { useRef, useEffect, useState } from "react"
import { motion, useMotionValue, useAnimation } from "framer-motion"
import styled from "@emotion/styled"

const StyledCard = styled(motion.div)`
  position: absolute;
`

export const Card = ({ children, style, onVote, id, ...props }) => {
  // motion stuff
  const cardElem = useRef(null)

  const x = useMotionValue(0)
  const controls = useAnimation()

  const [constrained, setConstrained] = useState(true)

  const [direction, setDirection] = useState()

  const [velocity, setVelocity] = useState()

  const getVote = (childNode, parentNode) => {
    const childRect = childNode.getBoundingClientRect()
    const parentRect = parentNode.getBoundingClientRect()
    let result =
      parentRect.left >= childRect.right
        ? false
        : parentRect.right <= childRect.left
        ? true
        : undefined
    return result
  }

  // determine direction of swipe based on velocity
  const getDirection = () => {
    return velocity >= 1 ? "right" : velocity <= -1 ? "left" : undefined
  }

  const getTrajectory = () => {
    setVelocity(x.getVelocity())
    setDirection(getDirection())
  }

  const flyAway = (min) => {
    const flyAwayDistance = (direction) => {
      const parentWidth = cardElem.current.parentNode.getBoundingClientRect()
        .width
      const childWidth = cardElem.current.getBoundingClientRect().width
      return direction === "left"
        ? -parentWidth / 2 - childWidth / 2
        : parentWidth / 2 + childWidth / 2
    }

    if (direction && Math.abs(velocity) > min) {
      setConstrained(false)
      controls.start({
        x: flyAwayDistance(direction)
      })
    }
  }

  useEffect(() => {
    const unsubscribeX = x.onChange(() => {
      const childNode = cardElem.current
      const parentNode = cardElem.current.parentNode
      const result = getVote(childNode, parentNode)
      result !== undefined && onVote(result)
    })

    return () => unsubscribeX()
  })

  return (
    <StyledCard
      animate={controls}
      dragConstraints={constrained && { left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      ref={cardElem}
      style={{ x }}
      onDrag={getTrajectory}
      onDragEnd={() => flyAway(500)}
      whileTap={{ scale: 1.1 }}
      {...props}
    >
      {children}
    </StyledCard>
  )
}
