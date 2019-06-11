import React from 'react';
import {
  RkPicker,
} from 'react-native-ui-kitten';

export class DatePicker extends React.Component {
  componentName = 'DatePicker';

  static DatePart = Object.freeze({YEAR: 1, MONTH: 2, DAY: 3});

  constructor(props) {
    super(props);
    this.state = {pickerVisible: false};
    this.days = this.generateArrayFromRange(1, 31);
    this.years = this.generateArrayFromRange(1940, new Date().getFullYear() + 1);
    this.months = [
      {key: 1, value: '1'}, {key: 2, value: '2'},
      {key: 3, value: '3'}, {key: 4, value: '4'},
      {key: 5, value: '5'}, {key: 6, value: '6'},
      {key: 7, value: '7'}, {key: 8, value: '8'},
      {key: 9, value: '9'}, {key: 10, value: '10'},
      {key: 11, value: '11'}, {key: 12, value: '11'},
    ];
  }

  handlePickedValue(date) {
    let resultDate = {};
    if (this.props.customDateParts) {
      let i = 0;
      if (this.props.customDateParts.includes(DatePicker.DatePart.MONTH))
        resultDate['month'] = date[i++];
      if (this.props.customDateParts.includes(DatePicker.DatePart.DAY))
        resultDate['day'] = date[i++];
      if (this.props.customDateParts.includes(DatePicker.DatePart.YEAR))
        resultDate['year'] = date[i];
    } else {
      resultDate = { month: date[0], day: date[1], year: date[2] };
    }
    this.props.onConfirm(resultDate);
  };

  generateArrayFromRange(start, finish) {
    return Array.apply(null, Array(finish - start + 1)).map((_, i) => start + i);
  }

  findElementByKey(key, array){
    let element = array[0];
    array.forEach((value) => {
      if (value.key === key) element = value;
    });
    return element;
  }

  render() {
    let {
      onConfirm,
      selectedYear,
      selectedMonth,
      selectedDay,
      customDateParts,
      ...props
    } = this.props;

    let data = [this.months, this.days, this.years];
    let selectedOptions = [this.findElementByKey(selectedMonth, this.months), selectedDay || 1, selectedYear||2000];
    if (customDateParts) {
      selectedOptions = [];
      data = [];
      if (customDateParts.includes(DatePicker.DatePart.MONTH)) {
        data.push(this.months);
        selectedOptions.push(this.findElementByKey(selectedMonth, this.months));
      }
      if (customDateParts.includes(DatePicker.DatePart.DAY)) {
        data.push(this.days);
        selectedOptions.push(selectedDay || 1);
      }
      if (customDateParts.includes(DatePicker.DatePart.YEAR)) {
        data.push(this.years);
        selectedOptions.push(selectedYear||2000);
      }
    }

    return (
      <RkPicker
        rkType='highlight'
        title='Set Date'
        data={data}
        onConfirm={(date) => this.handlePickedValue(date)}
        selectedOptions={selectedOptions}
        optionRkType='subtitle small'
        selectedOptionRkType='header4'
        titleTextRkType='header4'
        cancelTextRkType='light'
        confirmTextRkType=''
        {...props}/>
    );
  }
}