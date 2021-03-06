// (C) 2007-2018 GoodData Corporation
import React from 'react';
import { mount } from 'enzyme';
import { noop } from 'lodash';

import TableTotalsAddButton from '../AddTotalButton';

describe('AddTotalButton', () => {
    function renderComponent(customProps = {}) {
        const props = {
            onClick: noop,
            onMouseEnter: noop,
            onMouseLeave: noop,
            disabled: false
        };

        return mount(
            <TableTotalsAddButton {...props} {...customProps} />
        );
    }

    it('should render button as visible', () => {
        const component = renderComponent();

        expect(component.find('.indigo-totals-add-row-button').length).toBe(1);
        expect(component.find('.hidden').length).toBe(0);
    });

    it('should render button as hidden', () => {
        const component = renderComponent({
            hidden: true
        });

        expect(component.find('.indigo-totals-add-row-button').length).toBe(1);
        expect(component.find('.hidden').length).toBe(1);
    });

    it('should propagate events', () => {
        const props = {
            onClick: jest.fn(),
            onMouseEnter: jest.fn(),
            onMouseLeave: jest.fn()
        };
        const component = renderComponent(props);

        component.find('.indigo-totals-add-row-button').simulate('click');
        component.find('.indigo-totals-add-row-button').simulate('mouseEnter');
        component.find('.indigo-totals-add-row-button').simulate('mouseLeave');

        expect(props.onClick).toHaveBeenCalled();
        expect(props.onMouseEnter).toHaveBeenCalled();
        expect(props.onMouseLeave).toHaveBeenCalled();
    });
});
