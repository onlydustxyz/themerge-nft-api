import http from 'k6/http';
import {check} from 'k6';

const addresses = [
  '0x73bca6ec83ae1a3e9db7f0181ac87a507fef6e48',
  '0x43da8bb267f2df1461c8bc5b27546d1918ebd089',
  '0xc4b880c473fa6af18080901792995993af116771',
  '0x28873c47a547dede3d412f902b1cd98a352f0c7a',
  '0x834ef385e0436105048d93782588b3a70c928c2b',
  '0x7727791cd9fdb4166749b96ab332e35a940af9a7',
  '0x34a37fd50e9d16165accc255b229d104b962b792',
];

export const options = {
  stages: [
    {duration: '1m', target: 100}, // below normal load
    {duration: '2m', target: 100},
    {duration: '2m', target: 200}, // normal load
    {duration: '5m', target: 200},
    {duration: '2m', target: 300}, // around the breaking point
    {duration: '5m', target: 300},
    {duration: '2m', target: 400}, // beyond the breaking point
    {duration: '5m', target: 400},
    {duration: '10m', target: 0}, // scale down. Recovery stage.
  ],
};

export default function () {
  const responses = http.batch(
    addresses.map(address => [
      'GET',
      `https://themerge-nft-api-production.herokuapp.com/proof?address=${address}`,
    ])
  );
  responses.forEach(response => {
    check(response, {
      'is status 200': r => r.status === 200,
    });
  });
}
