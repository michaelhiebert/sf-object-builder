import React from "react";

export default class UpsertMetadata extends React.Component {
  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);

    this.state = {
      metadata: [
        {
          fullName: "TestObject__c",
          label: "Upserted Object",
          pluralLabel: "Upserted Object",
          nameField: {
            type: "Text",
            label: "Test Object Name",
          },
          fields: [
            {
              fullName: "A_Text_Field__c",
              externalId: "false",
              label: "A Text Field",
              required: "false",
              trackTrending: "false",
              type: "Text",
              unique: "false",
              length: "45",
            },
            {
              fullName: "A_Number_Field__c",
              externalId: "false",
              label: "A Number Field",
              precision: "18",
              required: "true",
              scale: "0",
              trackTrending: "false",
              type: "Number",
              unique: "true",
            },
          ],
          deploymentStatus: "Deployed",
          sharingModel: "ReadWrite",
        },
        {
          fullName: "TestObject2__c",
          label: "Upserted Object 2",
          pluralLabel: "Upserted Object 2",
          nameField: {
            type: "Text",
            label: "Test Object 2 Name",
          },
          deploymentStatus: "Deployed",
          sharingModel: "ReadWrite",
        },
      ],
    };
  }

  handleClose() {
    this.setState({hasAlert: false});
  }
  
  handleSubmit = (event) => {
    event.preventDefault();
    const metadata = this.state.metadata;
    if (!metadata) {
      return;
    }
    this.props.onExecute({ metadata });
  };

  handleChange = (e) => {
    this.setState({ metadata: e.target.value });
  };

  render() {
    return (
      <form
        className="slds-form--stacked slds-m-bottom--xx-large"
        onSubmit={this.handleSubmit}
      >
        <div className="slds-form-element">
          <label
            className="slds-form-element__label slds-text-heading--medium"
            htmlFor="metadata"
          >
            <abbr className="slds-required" title="required">
              *
            </abbr>
            Metadata
          </label>
          <div className="slds-form-element__control">
            {JSON.stringify(this.state.metadata)}
          </div>
        </div>

        <div className="slds-form-element slds-clearfix">
          <div className="slds-float--right">
            <button
              className="slds-button slds-button--brand"
              type="submit"
              disabled={!this.state.metadata}
            >
              <svg
                aria-hidden="true"
                className="slds-button__icon--stateful slds-button__icon--left"
              >
                <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
              </svg>
              Execute
            </button>
          </div>
        </div>
      </form>
    );
  }
}
