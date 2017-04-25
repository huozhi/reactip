import React, {Component, cloneElement} from 'react'
import {
  findDOMNode,
  unmountComponentAtNode,
  unstable_renderSubtreeIntoContainer as renderSubtreeIntoContainer
} from 'react-dom'
import cx from 'classnames'
import {position, getOppositePlacement, isInViewport} from './utils'
import './index.css'


class Tooltip extends Component {
  static defaultProps = {
    offsetParent: document.body,
  }

  componentDidMount() {
    this.mountDom = document.createElement('div')
    document.body.appendChild(this.mountDom)
  }

  componentWillUnmount() {
    unmountComponentAtNode(this.mountDom)
    document.body.removeChild(this.mountDom)
    this.mountDom = null
  }

  handleMouseEnter = (e) => {
    this.open()
  }

  handleMouseLeave = (e) => {
    this.close()
  }

  handleClick = () => {
    if (this.tooltip) {
      this.close()
    } else {
      this.open()
    }
    const {children} = this.props
    if (children && children.props.onClick) {
      children.props.onClick()
    }
  }

  getOffset = () => {
    const parentBcr = this.props.offsetParent.getBoundingClientRect()
    const bcr = findDOMNode(this).getBoundingClientRect()
    return {
      left: bcr.left,
      right: bcr.right,
      width: bcr.width,
      height: bcr.height,
      top: bcr.top - parentBcr.top,
      bottom: bcr.bottom - parentBcr.top,
    }
  }

  makeOverlay = () => {
    const {placement, tooltip} = this.props
    const targetOffset = this.getOffset()
    let style = position(placement, targetOffset)
    let finalPlacement = placement

    const popupRect = this.tooltip
      ? this.tooltip.getBoundingClientRect()
      : {bottom: style.top, right: style.left}
    const bcr = {
      ...style,
      bottom: popupRect.bottom,
      right: popupRect.right,
    }

    if (!isInViewport(bcr)) {
      const oppositePlacement = getOppositePlacement(placement)
      style = position(oppositePlacement, targetOffset)
      finalPlacement = oppositePlacement
    }

    return (
      <div className={cx('Tooltip', `Tooltip--${finalPlacement}`)} style={style}>
        <div className="Tooltip-content" ref={(node) => { this.tooltip = node }}>
          {tooltip}
        </div>
      </div>
    )
  }

  open = () => {
    renderSubtreeIntoContainer(this, this.makeOverlay(), this.mountDom)
  }

  close = () => {
    renderSubtreeIntoContainer(this, <noscript />, this.mountDom)
  }

  render() {
    const {children} = this.props
    const triggerProps = {
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      onClick: this.handleClick,
    }

    return cloneElement(children, triggerProps)
  }
}

export default Tooltip
