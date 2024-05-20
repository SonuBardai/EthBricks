type Property = {
  name: string;
  image: string;
  description: string;
  price: string;
  id: string;
  attributes: { trait_type: string; value: number | string }[];
};

export default Property;
