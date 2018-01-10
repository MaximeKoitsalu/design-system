import React from 'react';
import classnames from 'classnames';
import Button from '../Button';
import ButtonGroup from '../ButtonGroup';

import FormField from './FormField';
import FormFlyout from './FormFlyout';
import FormSection from './FormSection';

const propTypes = {
  className: React.PropTypes.string,
  onChange: React.PropTypes.func,
  inline: React.PropTypes.bool,
  onCancel: React.PropTypes.func,
  onSubmit: React.PropTypes.func,
  cancellable: React.PropTypes.bool,
  submittable: React.PropTypes.bool,
  validator: React.PropTypes.func,
  errors: React.PropTypes.object,
  size: React.PropTypes.string,
  children: React.PropTypes.any,
};

const defaultProps = {
  errors: {},
  className: '',
  size: 'small',
  inline: false,
  onChange: null,
  onSubmit: null,
  children: null,
  validator: null,
  onCancel: () => {},
  cancellable: false,
  submittable: false,
};

const getValues = (children) => {
  let values = {};

  React.Children.forEach(children, (child) => {
    if (child) {
      if (child.props.name) {
        values[child.props.name] = child.props.value;
      } else if (child.props.children) {
        values = Object.assign(values, getValues(child.props.children));
      }

      // TODO: Figure something else out here. This is incredibly hacky and makes me cry.
      if (child.props.flyout) {
        values = Object.assign(values, getValues(child.props.flyout.props.children));
      }
    }
  });

  return values;
};

const validate = (validator, values) => (validator ? validator(values) : {});

/**
 * `Form` is a container component for rendering forms.
 */
class Form extends React.Component {
  constructor(props) {
    super(props);

    const defaultValues = getValues(props.children);

    this.state = {
      values: defaultValues,
      valid: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onSubmit() {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state);
    }
  }

  onCancel() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  onChange(name) {
    return (value) => {
      const newState = Object.assign({}, this.state);
      newState.values[name] = value;
      newState.valid = Object.keys(validate(this.props.validator, newState.values)).length === 0;

      this.setState(newState, () => {
        if (this.props.onChange) {
          this.props.onChange(name, this.state.values, this.state.valid);
        }
      });
    };
  }

  renderField(child) {
    return React.cloneElement(child, {
      error: child.props.error || this.props.errors[child.props.name],
      value: this.state.values[child.props.name],
      onChange: this.onChange(child.props.name),
      size: this.props.size,
      key: child.props.name,
    });
  }

  renderFlyout(flyout) {
    const props = {};

    if (flyout.props.children) {
      props.children = this.renderChildren(flyout.props.children);
    }

    return React.cloneElement(flyout, props);
  }

  renderSection(child) {
    const props = {
      children: this.renderChildren(child.props.children),
    };

    // Only render the flyout fields if they have been provided.
    if (child.props.flyout) {
      props.flyout = this.renderFlyout(child.props.flyout);
    }

    return React.cloneElement(child, props);
  }

  renderChildren(children) {
    const jsx = [];

    React.Children.forEach(children, (child) => {
      if (child && child.type === FormField) {
        jsx.push(this.renderField(child));
      } else if (child && child.type === FormSection) {
        jsx.push(this.renderSection(child));
      }
    });

    return jsx;
  }

  renderActions() {
    let jsx = [];

    if (this.props.cancellable) {
      jsx.push(
        <Button
          key="cancel"
          secondary
          size={ this.props.size }
          onClick={ this.onCancel }
          label="cancel"
        />,
      );
    }

    if (this.props.submittable) {
      jsx.push(
        <Button
          key="submit"
          size={ this.props.size }
          disabled={ !this.state.valid }
          onClick={ this.onSubmit }
          label="submit"
        />,
      );
    }

    if (jsx.length) {
      jsx = (
        <div className="rc-form-actions">
          <ButtonGroup>
            { jsx }
          </ButtonGroup>
        </div>
      );
    }

    return jsx;
  }

  render() {
    const children = this.renderChildren(this.props.children);
    const actions = this.renderActions();
    const className = classnames('rc-form', this.props.className, `rc-form-${this.props.size}`, {
      'rc-form-inline': this.props.inline,
    });

    return (
      <form className={ className }>
        <fieldset className="rc-form-fields">
          { children }
        </fieldset>
        { actions }
      </form>
    );
  }
}

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

Form.Field = FormField;
Form.Flyout = FormFlyout;
Form.Section = FormSection;

export default Form;
