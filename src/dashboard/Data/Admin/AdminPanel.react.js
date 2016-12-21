import React         from 'react';
import Parse         from 'parse';

import ParseApp      from 'lib/ParseApp';
import DashboardView from 'dashboard/DashboardView.react';
import Button        from 'components/Button/Button.react';
import Fieldset      from 'components/Fieldset/Fieldset.react';
import Toolbar       from 'components/Toolbar/Toolbar.react';
import SegmentSelect from 'components/SegmentSelect/SegmentSelect.react';
import Field         from 'components/Field/Field.react';
import Label         from 'components/Label/Label.react';
import TextInput     from 'components/TextInput/TextInput.react';
import FlowFooter    from 'components/FlowFooter/FlowFooter.react';
import JsonPrinter   from 'components/JsonPrinter/JsonPrinter.react';

import fieldStyle    from 'components/Field/Field.scss';
import styles        from 'dashboard/Data/Admin/AdminPanel.scss';

const cloudsInfo = {
  SysGift: {
    helpText: '添加系统礼金，方便测试。',
    params: [
      { key: 'id', helpText: '用户ID' },
      { key: 'amount', helpText: '金额' },
    ],
  },
  ApproveAudit: {
    helpText: '通过身份认证。',
    params: [
      { key: 'id', helpText: '认证申请ID' },
    ],
  },
  RejectAudit: {
    helpText: '回绝身份认证。',
    params: [
      { key: 'id', helpText: '认证申请ID' },
      { key: 'reason', helpText: '回绝原因，用来提示用户修改' },
    ],
  },
  FundingProject: {
    helpText: '资金托管支付',
    params: [
      { key: 'id', helpText: '资金 Fund Id' },
      { key: 'notes', helpText: '备注，比如附上转账流水'},
      { key: 'amount', helpText: '充值的金额'},
    ],
  }
};

export default class AdminPanel extends DashboardView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Admin Panel';

    this.clouds = Object.keys(cloudsInfo);
    this.state = {
      currentCloud: this.clouds[0],
      inProgress: false,
      data: {},
      submitInfo: {},
    };

    this.onChangeSeg = this.onChangeSeg.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChangeSeg(value) {
    this.setState({
      currentCloud: value,
      data: {},
      submitInfo: {},
    })
  }

  onChangeFieldFactory(field) {
    return (value) => {
      this.onChangeInput({ [field]: value });
    };
  }

  onChangeInput(setter) {
    this.setState({
      data: Object.assign({}, this.state.data, setter),
      submitInfo: {},
    });
  }

  onSubmit() {
    this.setState({
      inProgress: true,
    });
    return Parse.Cloud.run(this.state.currentCloud, this.state.data)
      .then((resp) => {
        this.setState({
          inProgress: false,
          submitInfo: {
            success: resp,
          },
        });
      }, (e) => {
        this.setState({
          inProgress: false,
          submitInfo: {
            error: e,
          },
        });
      });
  }

  renderFields() {
    const cloud = this.state.currentCloud;
    const description = cloudsInfo[cloud].helpText;
    const params = cloudsInfo[cloud].params;
    return (
      <div>
        <Fieldset
          legend={cloud}
          description={description}>
          {params.map((p) => (
            <Field
              key={p.key+cloud}
              label={<Label text={p.key} description={p.helpText} />}
              input={<TextInput monospace={true} value={this.state.data[p.key] || ''} onChange={this.onChangeFieldFactory(p.key).bind(this)} />}
            />
          ))}
        </Fieldset>
      </div>
    );
  }

  renderSubmitBtn() {
    const hasError = false;
    return (
      <Button primary={true} disabled={hasError}
        value='Run Cloud code' progress={this.state.inProgress}
        onClick={this.onSubmit}
      />
    );
  }

  renderContent() {
    return (
      <div style={{ padding: '120px 0 60px 0' }}>
        <Fieldset>
          <SegmentSelect values={this.clouds} current={this.state.currentCloud} onChange={this.onChangeSeg} />
        </Fieldset>
        {this.renderFields()}
        <Fieldset
          legend='Results'
          description=''>
          <div className={fieldStyle.field}>
            <JsonPrinter object={this.state.submitInfo} />
          </div>
        </Fieldset>
        <Toolbar section={this.section} subsection={this.subsection} />
        <FlowFooter
          primary={this.renderSubmitBtn()} />
      </div>
    );
  }
}

AdminPanel.contextTypes = {
  currentApp: React.PropTypes.instanceOf(ParseApp)
}

