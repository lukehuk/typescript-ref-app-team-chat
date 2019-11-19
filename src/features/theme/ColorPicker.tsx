import React, { CSSProperties } from "react";
import { SketchPicker, ColorResult, RGBColor } from "react-color";

interface IProps {
  propertyName: string;
  property: string;
}

interface IState {
  displayColorPicker: boolean;
  color: RGBColor;
}

class ColorPicker extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    var prop = getComputedStyle(document.documentElement).getPropertyValue(
      props.property
    );
    var col = this.RGBvalues().color(prop);
    this.state = {
      displayColorPicker: false,
      color: {
        r: col === undefined ? 255 : (col.r as number),
        g: col === undefined ? 255 : (col.g as number),
        b: col === undefined ? 255 : (col.b as number),
        a: 1
      }
    };
  }

  RGBvalues = () => {
    var _hex2dec = function(v: any) {
      return parseInt(v, 16);
    };

    var _splitHEX = function(hex: string) {
      var c;
      if (hex.length === 4) {
        c = hex.replace("#", "").split("");
        return {
          r: _hex2dec(c[0] + c[0]),
          g: _hex2dec(c[1] + c[1]),
          b: _hex2dec(c[2] + c[2])
        };
      } else {
        return {
          r: _hex2dec(hex.slice(1, 3)),
          g: _hex2dec(hex.slice(3, 5)),
          b: _hex2dec(hex.slice(5))
        };
      }
    };

    var _splitRGB = function(rgb: string) {
      var c = rgb.slice(rgb.indexOf("(") + 1, rgb.indexOf(")")).split(",");
      var v = c.map(function(n, i) {
        return i !== 3 ? parseInt(n, 10) : parseFloat(n);
      });
      var obj = {
        r: v[0],
        g: v[1],
        b: v[2]
      };
      return obj;
    };

    var color = function(col: string) {
      var slc = col.slice(0, 1);
      if (slc === "#") {
        return _splitHEX(col);
      } else if (slc.toLowerCase() === "r") {
        return _splitRGB(col);
      } else {
        console.log(
          "!Ooops! RGBvalues.color(" +
            col +
            ") : HEX, RGB, or RGBa strings only"
        );
      }
    };

    return {
      color: color
    };
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleChange = (color: ColorResult) => {
    document.documentElement.style.setProperty(
      this.props.property,
      "rgb(" + color.rgb.r + "," + color.rgb.g + "," + color.rgb.b + ")"
    );
    this.setState({ color: color.rgb });
  };

  render() {
    const colorStyle = {
      width: "36px",
      height: "14px",
      borderRadius: "2px",
      background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`
    } as React.CSSProperties;

    const swatchStyle = {
      padding: "5px",
      background: "#fff",
      borderRadius: "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
      display: "inline-block",
      cursor: "pointer"
    } as React.CSSProperties;

    const popoverStyle = {
      position: "absolute",
      zIndex: 2
    } as React.CSSProperties;

    const coverStyle = {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px"
    } as React.CSSProperties;

    return (
      <div>
        <h3>{this.props.propertyName}</h3>
        <div style={swatchStyle} onClick={this.handleClick}>
          <div style={colorStyle} />
        </div>
        {this.state.displayColorPicker ? (
          <div style={popoverStyle}>
            <div style={coverStyle} onClick={this.handleClose} />
            <SketchPicker
              disableAlpha={true}
              color={this.state.color}
              onChange={this.handleChange}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default ColorPicker;
