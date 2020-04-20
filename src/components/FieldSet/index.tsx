import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import CommonPropsContext from '../../context/common-props';
import { useFormContext, usePath, commonPropTypes, useCommonProps } from '../../context';
import PathContext from '../../context/path';
import { createFieldPath } from '../../utils';
import FieldSetContext from './context';
import { useWatch } from '../../hooks';
import { FieldSetProps } from './FieldSet';

const FieldSet: React.FC<FieldSetProps> = ({
  children,
  name,
  watch,
  index,
  getValue,
  setValue,
  nameSeparator,
  getters
}) => {
  const path = usePath();
  const { getState, dispatch } = useFormContext();
  const commonProps = useCommonProps({ getValue, setValue, nameSeparator, getters });

  const fieldSetPath = createFieldPath({ path, name, index, nameSeparator: commonProps.nameSeparator });
  const fieldSetState = getState(fieldSetPath);

  const [newFieldSetState, setNewFieldSetState] = useState(fieldSetState);

  const subscribe = useMemo(
    () => (): void => {
      setNewFieldSetState(prevFieldSetState => {
        if (JSON.stringify(prevFieldSetState) !== JSON.stringify(fieldSetState)) {
          return Array.isArray(fieldSetState) ? [...fieldSetState] : { ...fieldSetState };
        }

        return prevFieldSetState;
      });
    },
    [newFieldSetState]
  );

  useWatch(newFieldSetState, watch);

  useEffect(() => {
    return () => {
      dispatch({
        type: 'unregister',
        payload: {
          fieldPath: fieldSetPath
        }
      });
    };
  }, []);

  return useMemo(
    () => (
      <CommonPropsContext.Provider value={commonProps}>
        <FieldSetContext.Provider value={subscribe}>
          <PathContext.Provider value={fieldSetPath}>{children}</PathContext.Provider>
        </FieldSetContext.Provider>
      </CommonPropsContext.Provider>
    ),
    [newFieldSetState]
  );
};

FieldSet.displayName = 'FieldSet';

FieldSet.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element.isRequired).isRequired,
    PropTypes.element.isRequired
  ]).isRequired,
  index: PropTypes.number,
  ...commonPropTypes
};

export default FieldSet;
