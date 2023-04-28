import { ItemDetailModel } from '../../models/ItemDetail.model';
import { FC } from 'react';
import { CommonProps } from '../../interfaces/CommonProps';
import cx from 'classnames';
import css from './ItemDetail.module.css';
import { Icon } from '../icon/Icon';

interface Props extends CommonProps {
  data: ItemDetailModel;
}

export const ItemDetail: FC<Props> = ({ data, ...props }) => {
  return (
    <div className={cx(props.className, css.root)} data-testid={props.testId}>
      {data.image && (
        <img className={css.image} src={`data:image;base64,${data.image}`} alt={data.description} />
      )}
      <div className={cx(css.flex, css.centerColumn, css.content)}>
        <h2>{data.description}</h2>
        <h4>Size: {data.size}</h4>
        {data.tags && data.tags.length > 0 && (
          <div className={cx(css.flex, css.marginTop)}>
            {data.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}
        <div className={cx(css.flex, css.marginTop)}>
          <Icon
            size="min(20%, 5rem)"
            name={data.temperature === 0 ? 'handWash' : `wash${data.temperature}Degrees`}
          />
          <Icon size="min(20%, 5rem)" name={data.dryerFriendly ? 'dryerYes' : 'dryerNo'} />
          <Icon size="min(20%, 5rem)" name={data.ironingFriendly ? 'ironingYes' : 'ironingNo'} />
          <Icon
            size="min(20%, 5rem)"
            name={data.whiteningFriendly ? 'whiteningYes' : 'whiteningNo'}
          />
        </div>
      </div>
    </div>
  );
};
