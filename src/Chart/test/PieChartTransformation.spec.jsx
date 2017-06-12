import React from 'react';
import { range } from 'lodash';
import { renderIntoDocument } from 'react-addons-test-utils';
import { shallow } from 'enzyme';
import PieChartTransformation, { PIE_CHART_LIMIT } from '../PieChartTransformation';
import HighChartRenderer from '../HighChartRenderer';
import { TOP } from '../Legend/PositionTypes';
import { data, config } from '../../test/fixtures';


const SINGLE_DATA_METRIC_DATA = {
    isLoaded: true,
    isLoading: false,
    headers: [
        {
            id: 'm1',
            title: 'Metric',
            type: 'metric',
            uri: '/gdc/m1',
            format: '#,##0'
        },
        {
            id: 'date',
            title: 'Date',
            type: 'attrLabel',
            uri: '/gdc/date'
        }
    ],
    rawData: [
        [
            '2010',
            '1324'
        ]
    ]
};

const TOO_MANY_DATAPOINTS = {
    ...SINGLE_DATA_METRIC_DATA,
    rawData: range(PIE_CHART_LIMIT + 1)
        .map(i => [`${2010 + i}`, '12345'])
};

const NEGATIVE_DATAPOINTS = {
    ...SINGLE_DATA_METRIC_DATA,
    rawData: [
        [
            'a1',
            '-5'
        ],
        [
            'a2',
            '10'
        ],
        [
            'a3',
            '-0.234'
        ]
    ]
};

const SINGLE_DATA_METRIC_CONFIG = {
    type: 'pie',
    buckets: {
        measures: [
            {
                measure: {
                    type: 'metric',
                    objectUri: '/gdc/m1',
                    metricAttributeFilters: [],
                    showInPercent: false,
                    showPoP: false,
                    format: '#,##0',
                    sorts: []
                }
            }
        ],
        categories: [
            {
                category: {
                    type: 'date',
                    collection: 'attribute',
                    displayForm: '/gdc/date',
                    dateFilterSettings: {
                        granularity: 'GDC.time.year'
                    }
                }
            }
        ]
    },
    legend: {
        enabled: false
    }
};

describe('PieChartTransformation', () => {
    function createComponent(customProps = {}) {
        const defaultProps = {
            config: {
                ...config,
                legend: {
                    enabled: true,
                    position: TOP
                }
            },
            data
        };
        const props = { ...defaultProps, ...customProps };
        return <PieChartTransformation {...props} />;
    }

    it('should use custom renderer', () => {
        const pieChartRenderer = jest.fn().mockReturnValue(<div />);
        renderIntoDocument(createComponent({ pieChartRenderer }));
        expect(pieChartRenderer).toHaveBeenCalled();
    });

    it('should always disable legend for series with one value', () => {
        const pieChartRenderer = jest.fn().mockReturnValue(<div />);
        renderIntoDocument(createComponent({
            pieChartRenderer,
            data: SINGLE_DATA_METRIC_DATA,
            config: {
                ...SINGLE_DATA_METRIC_CONFIG,
                legend: {
                    enabled: true,
                    position: TOP
                }
            }
        }));
        const passedProps = pieChartRenderer.mock.calls[0][0];
        expect(passedProps.legend.enabled).toEqual(false);
    });

    it('should render HighChartRenderer', () => {
        const wrapper = shallow(createComponent());
        expect(wrapper.find(HighChartRenderer)).toHaveLength(1);
    });

    describe('exceeding data point limit', () => {
        it('should not render if data point limit is exceeded', () => {
            const wrapper = shallow(createComponent({
                data: TOO_MANY_DATAPOINTS,
                config: {
                    ...SINGLE_DATA_METRIC_CONFIG,
                    legend: {
                        enabled: false
                    }
                }
            }));

            expect(wrapper.find(HighChartRenderer)).toHaveLength(0);
        });

        it('should not render if data point limit is exceeded after the component is already mounted', () => {
            const wrapper = shallow(createComponent({
                data: SINGLE_DATA_METRIC_DATA,
                config: {
                    ...SINGLE_DATA_METRIC_CONFIG,
                    legend: {
                        enabled: false
                    }
                }
            }));

            wrapper.setProps({ data: TOO_MANY_DATAPOINTS });

            expect(wrapper.find(HighChartRenderer)).toHaveLength(0);
        });

        it('should call the "onDataTooLarge" callback', () => {
            const callback = jest.fn();

            shallow(createComponent({
                data: TOO_MANY_DATAPOINTS,
                config: {
                    ...SINGLE_DATA_METRIC_CONFIG,
                    legend: {
                        enabled: false
                    }
                },
                onDataTooLarge: callback
            }));

            expect(callback).toBeCalled();
        });
    });

    describe('negative values', () => {
        it('should not render if any of data points is negative', () => {
            const wrapper = shallow(createComponent({
                data: NEGATIVE_DATAPOINTS,
                config: {
                    ...SINGLE_DATA_METRIC_CONFIG,
                    legend: {
                        enabled: false
                    }
                }
            }));

            expect(wrapper.find(HighChartRenderer)).toHaveLength(0);
        });

        it('should not render if any of data points is negative after the component is already mounted', () => {
            const wrapper = shallow(createComponent({
                data: SINGLE_DATA_METRIC_DATA,
                config: {
                    ...SINGLE_DATA_METRIC_CONFIG,
                    legend: {
                        enabled: false
                    }
                }
            }));

            wrapper.setProps({ data: NEGATIVE_DATAPOINTS });

            expect(wrapper.find(HighChartRenderer)).toHaveLength(0);
        });

        it('should call the "onNegativeValues" callback', () => {
            const callback = jest.fn();

            shallow(createComponent({
                data: NEGATIVE_DATAPOINTS,
                config: {
                    ...SINGLE_DATA_METRIC_CONFIG,
                    legend: {
                        enabled: false
                    }
                },
                onNegativeValues: callback
            }));

            expect(callback).toBeCalled();
        });
    });
});