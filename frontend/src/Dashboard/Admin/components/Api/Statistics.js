import React, { Component } from 'react';
import PieChart from './components/PieChart'
import LineChart from './components/LineChart'
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';

class Statistics extends Component {
    state = {chartData: []}
    componentDidMount() {
       fetch("/api/waste?groupByType=true&includeDataPoints=true")
       .then(response => response.json())
       .then(json => {
           this.setState({chartData: json})
       });
    }

  handleFilterChartsByDate(event, picker) {
       console.warn("All " + this.state.chartData);
       fetch("/api/waste?groupByType=true&includeDataPoints=true&from="+moment(picker.startDate).format('YYYY-MM-DD')+"&to="+moment(picker.endDate).format('YYYY-MM-DD'))
       .then(response => response.json())
       .then(json => {
           console.log(json);
           if(json.length > 0) {
               this.setState({chartData: json})
           }
       });
  }

  render() {
    return(
        <div>
          <div className="d-inline-flex p-2">
              <DateRangePicker
                  initialSettings={{ startDate: '01/05/2021', endDate: '01/06/2021' }}
                  onApply={this.handleFilterChartsByDate.bind(this)}
                >
                  <input type="text" className="form-control" />
              </DateRangePicker>
          </div>

            <div className="row">
              <div className="col-xl-8 col-lg-7">
                  <div className="card shadow mb-4">
                      <div className="card-body">
                             <LineChart title="Waste" data={this.state.chartData}/>
                      </div>
                  </div>
              </div>

              <div className="col-xl-4 col-lg-5">
                  <div className="card shadow mb-4">
                      <div className="card-body">
                        <PieChart title="Waste" data={this.state.chartData}/>
                      </div>
                  </div>
              </div>
            </div>
        </div>
    )
  }
}

export default Statistics