import React from "react";

interface IProps {
  propertyName: string;
  property: string;
}

interface IState {
  logoUrl: string;
}

class LogoPicker extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    var prop = getComputedStyle(document.documentElement).getPropertyValue(
      props.property
    );
    var url = prop.replace('url("', "").replace('")', "");
    this.state = {
      logoUrl: url === undefined ? "" : url
    };
  }

  handleKeyDown = (e: React.ChangeEvent) => {
    const value = (e.target as HTMLInputElement).value;
    document.documentElement.style.setProperty(
      this.props.property,
      'url("' + value + '")'
    );
    this.setState({ logoUrl: value });
  };

  render() {
    const inputStyle = {
      width: "300px",
      height: "30px",
      borderRadius: "2px"
    } as React.CSSProperties;

    return (
      <div>
        <h3>{this.props.propertyName}</h3>
        <input
          type="text"
          style={inputStyle}
          onChange={this.handleKeyDown}
          value={this.state.logoUrl}
        ></input>
      </div>
    );
  }
}

export default LogoPicker;
