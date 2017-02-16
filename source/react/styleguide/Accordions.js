import React from 'react';
import StyleguideSection from './partials/StyleguideSection';
import Accordion from '../library/accordion/Accordion';
import AccordionItem from '../library/accordion/AccordionItem';

class Accordions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      position: null
    };
  }

  render() {
    return (
      <div>
        <h1>Accordions</h1>
        <StyleguideSection title="Accordions">
           <Accordion>
             <AccordionItem title="First element">
               <div>Hello, world! From the first element.</div>
             </AccordionItem>
             <AccordionItem title="Second element">
               <div>Hello, world! From the second element.</div>
             </AccordionItem>
             <AccordionItem title="Third element">
               <div>Hello, world! From the third element.</div>
             </AccordionItem>
           </Accordion>
        </StyleguideSection>
      </div>
    );
  }
}

export default Accordions;
