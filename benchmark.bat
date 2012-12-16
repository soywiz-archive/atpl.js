@echo off
tsc benchmarks/benchmark.ts --target ES5 && node "benchmarks/benchmark.js"