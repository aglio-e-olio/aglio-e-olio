import React from 'react';

const Card = () => {
  return (
    <div>
      <div class="card w-auto bg-base-100 shadow-xl">
        <figure class="px-10 pt-10">
          <img
            src="https://api.lorem.space/image/shoes?w=400&h=225"
            alt="Shoes"
            class="rounded-xl"
          />
        </figure>
        <div class="card-body items-center text-center">
          <h2 class="card-title">Shoes!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div class="card-actions">
            <button class="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
      <div class="badge badge-outline">neutral</div>
      <div class="badge badge-primary badge-outline">primary</div>
      <div class="badge badge-secondary badge-outline">secondary</div>
      <div class="badge badge-accent badge-outline">accent</div>
    </div>
  );
};

export default Card;
