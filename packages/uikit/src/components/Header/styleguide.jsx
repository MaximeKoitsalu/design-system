import { bool, string } from 'prop-types';
import React from 'react';

import Header from '.';
import { withControls } from '../../../styleguide/client/higherOrderComponents';
import { boolean, select, text } from '../../../styleguide/client/knobs';
import typography from '../../styles/typography.css';

const typeOptions = [
  { text: 'h1', value: 'h1' },
  { text: 'h2', value: 'h2' },
  { text: 'h3', value: 'h3' },
  { text: 'h4', value: 'h4' },
];

const knobs = {
  content: text('Content', 'Header'),
  as: select('Type', typeOptions, 'h1'),
  numbers: boolean('Numbers alternate', false),
};

const HeaderStyleguide = ({ content, as, numbers }) => (
  <div>
    <div className={typography.heading1}>Header</div>
    <p>
      Our products utilize four different levels of header to communicate
      subject at a variety of hierarchical levels.
    </p>
    <Header as={as} numbers={numbers}>
      {content}
    </Header>
  </div>
);

HeaderStyleguide.propTypes = {
  content: string,
  as: string,
  numbers: bool,
};

HeaderStyleguide.defaultProps = {
  content: '',
  as: '',
  numbers: false,
};

export default withControls({ knobs })(HeaderStyleguide);
