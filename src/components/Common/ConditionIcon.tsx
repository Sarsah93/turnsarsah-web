// components/Common/ConditionIcon.tsx

import React from 'react';
import { Condition } from '../../types/Character';
import { Tooltip } from './Tooltip';
import '../styles/ConditionIcon.css';

interface ConditionIconProps {
  name: string;
  condition: Condition;
}

export const ConditionIcon: React.FC<ConditionIconProps> = ({ name, condition }) => {
  // 실제로는 조건별 아이콘 이미지를 로드하면 됨
  // 임시로 이니셜 표시
  const getInitial = (name: string) => name[0].toUpperCase();

  return (
    <Tooltip name={name} condition={condition}>
      <div className="condition-icon" title={name}>
        {getInitial(name)}
      </div>
    </Tooltip>
  );
};
