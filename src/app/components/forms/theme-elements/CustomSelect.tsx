'use client'
import React from 'react';
import { styled } from '@mui/material/styles';
import { Select, MenuItem, SelectProps } from '@mui/material';

interface CustomSelectProps extends Omit<SelectProps, 'displayEmpty'> {
  placeholder?: string;
}

const StyledSelect = styled(Select)(({ }) => ({}));

const CustomSelect = React.forwardRef<HTMLDivElement, CustomSelectProps>(
  ({ placeholder, children, ...props }, ref) => {
    return (
      <StyledSelect
        ref={ref}
        displayEmpty
        {...props}
        renderValue={(selected) => {
          if (!selected || selected === '') {
            return <span style={{ color: '#adb5bd' }}>{placeholder || 'Pilih...'}</span>;
          }
          // Find the label from children if available
          const childArray = React.Children.toArray(children);
          const selectedChild = childArray.find(
            (child: any) => child?.props?.value === selected
          );
          return (selectedChild as any)?.props?.children || selected;
        }}
      >
        {children}
      </StyledSelect>
    );
  }
);

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;
