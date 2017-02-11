import 'babel-polyfill';
import 'reflect-metadata';

declare const require: any;

let testsContext = require.context('.', true, /\.ts$/);
testsContext.keys().forEach(testsContext);
