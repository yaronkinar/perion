export interface TableColumn<Row> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  field?: keyof Row;
}
