import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemDetail } from './ItemDetail';
import { ItemDetailModel } from '../../models/ItemDetail.model';

const data: ItemDetailModel = {
  description: 'Description',
  dryerFriendly: false,
  id: 'hf384hf3bv3874b3',
  image: '',
  ironingFriendly: true,
  size: '34-36',
  tags: [],
  temperature: 40,
  whiteningFriendly: false,
};

describe('<ItemDetail />', () => {
  test('renders content', () => {
    render(<ItemDetail data={data} testId="item" />);

    const item = screen.getByTestId('item');
    expect(item).toBeInTheDocument();
  });
});
