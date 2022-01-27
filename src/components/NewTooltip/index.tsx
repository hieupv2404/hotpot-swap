import React,{useEffect} from 'react';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components'


const NewTooltip = (props) => {
    const crypto = require("crypto");
    useEffect(() => {
      ReactTooltip.rebuild();
    }, []);
  

    const id = crypto.randomBytes(16).toString("hex");
    const { dataTip, dataValue, className } = props;
    const style = {
        borderRadius: "10px"
    }

    return (
      <>
        <div
          className={className}
          data-iscapture='true' 
          data-for={id} 
          data-tip={dataTip} 
        >
          {dataValue}
        </div>
        <StyledReactTooltip html={true} id={id} style={style} />
      </>


    );
}

export default NewTooltip;
export const StyledReactTooltip = styled(ReactTooltip)`
text-align:left !important;
background: #5C6A86 !important;
font-family: SF UI Display;
font-style: normal;
font-weight: 600 !important;
word-wrap: break-word;      /* IE 5.5-7 */
white-space: -moz-pre-wrap; /* Firefox 1.0-2.0 */
white-space: pre-wrap;      /* current browsers */
line-height: 126.5%;
@media screen and (max-width:768px){
    max-width: 293px !important;
}
&.place-top {
  padding: 0.3rem 1rem;
    &:after{
      border-top-color: #5C6A86 !important;
    }
}
&.place-left {
  padding: 0.3rem 1rem;
  &:after{

    border-left-color: #5C6A86 !important;
  }
}
&.place-right {
  padding: 0.3rem 1rem;
  &:after{

    border-right-color: #5C6A86 !important;
  }
}
&.place-bottom {
  padding: 0.3rem 1rem;
  &:after{

    border-bottom-color: #5C6A86 !important;
  }
} 

`
