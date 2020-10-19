
/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import List from '../../../../src/data/List';
import Model from '../../../../src/model/Model';
import { createSourceFromSeriesDataOption } from '../../../../src/data/Source';



describe('List', function () {

    describe('Data Manipulation', function () {

        it('initData 1d', function () {
            const list = new List(['x', 'y'], new Model());
            list.initData([10, 20, 30]);
            expect(list.get('x', 0)).toEqual(10);
            expect(list.get('x', 1)).toEqual(20);
            expect(list.get('x', 2)).toEqual(30);
            expect(list.get('y', 1)).toEqual(20);
        });

        it('initData 2d', function () {
            const list = new List(['x', 'y'], new Model());
            list.initData([[10, 15], [20, 25], [30, 35]]);
            expect(list.get('x', 1)).toEqual(20);
            expect(list.get('y', 1)).toEqual(25);
        });

        it('initData 2d yx', function () {
            const list = new List(['y', 'x'], new Model());
            list.initData([[10, 15], [20, 25], [30, 35]]);
            expect(list.get('x', 1)).toEqual(25);
            expect(list.get('y', 1)).toEqual(20);
        });

        it('Data with option 1d', function () {
            const list = new List(['x', 'y'], new Model());
            list.initData([1, {
                value: 2,
                somProp: 'foo'
            }]);
            expect(list.getItemModel(1).get('somProp' as any)).toEqual('foo');
            expect(list.getItemModel(0).get('somProp' as any)).toBeNull();
        });

        it('Empty data', function () {
            const list = new List(['x', 'y'], new Model());
            list.initData([1, '-']);
            expect(list.get('y', 1)).toBeNaN();
        });

        it('getRawValue', function () {
            const list1 = new List(['x', 'y'], new Model());
            // here construct a new list2 because if we only use one list
            // to call initData() twice, list._chunkCount will be accumulated
            // to 1 instead of 0.
            const list2 = new List(['x', 'y'], new Model());

            list1.initData([1, 2, 3]);
            expect(list1.getItemModel(1).option).toEqual(2);

            list2.initData([[10, 15], [20, 25], [30, 35]]);
            expect(list2.getItemModel(1).option).toEqual([20, 25]);
        });

        it('indexOfRawIndex', function () {
            const list = new List(['x'], new Model());
            list.initData([]);
            expect(list.indexOfRawIndex(1)).toEqual(-1);

            const list1 = new List(['x'], new Model());
            list1.initData([0]);
            expect(list1.indexOfRawIndex(0)).toEqual(0);
            expect(list1.indexOfRawIndex(1)).toEqual(-1);

            const list2 = new List(['x'], new Model());
            list2.initData([0, 1, 2, 3]);
            expect(list2.indexOfRawIndex(1)).toEqual(1);
            expect(list2.indexOfRawIndex(2)).toEqual(2);
            expect(list2.indexOfRawIndex(5)).toEqual(-1);

            const list3 = new List(['x'], new Model());
            list3.initData([0, 1, 2, 3, 4]);
            expect(list3.indexOfRawIndex(2)).toEqual(2);
            expect(list3.indexOfRawIndex(3)).toEqual(3);
            expect(list3.indexOfRawIndex(5)).toEqual(-1);

            list3.filterSelf(function (idx) {
                return idx >= 2;
            });
            expect(list3.indexOfRawIndex(2)).toEqual(0);
        });

        it('getDataExtent', function () {
            const list = new List(['x', 'y'], new Model());
            list.initData([1, 2, 3]);
            expect(list.getDataExtent('x')).toEqual([1, 3]);
            expect(list.getDataExtent('y')).toEqual([1, 3]);
        });

        it('Data types', function () {
            const list = new List([{
                name: 'x',
                type: 'int'
            }, {
                name: 'y',
                type: 'float'
            }], new Model());
            list.initData([[1.1, 1.1]]);
            expect(list.get('x', 0)).toEqual(1);
            expect(list.get('y', 0)).toBeCloseTo(1.1, 5);
        });

        it('map', function () {
            const list = new List(['x', 'y'], new Model());
            list.initData([[10, 15], [20, 25], [30, 35]]);
            expect(list.map(['x', 'y'], function (x: number, y: number) {
                return [x + 2, y + 2];
            }).mapArray('x', function (x) {
                return x;
            })).toEqual([12, 22, 32]);
        });

        it('mapArray', function () {
            const list = new List(['x', 'y'], new Model());
            list.initData([[10, 15], [20, 25], [30, 35]]);
            expect(list.mapArray(['x', 'y'], function (x, y) {
                return [x, y];
            })).toEqual([[10, 15], [20, 25], [30, 35]]);
        });

        it('filterSelf', function () {
            const list = new List(['x', 'y'], new Model());
            list.initData([[10, 15], [20, 25], [30, 35]]);
            expect(list.filterSelf(['x', 'y'], function (x, y) {
                return x < 30 && x > 10;
            }).mapArray('x', function (x) {
                return x;
            })).toEqual([20]);
        });

        it('dataProvider', function () {
            const list = new List(['x', 'y'], new Model());
            const typedArray = new Float32Array([10, 10, 20, 20]);
            const source = createSourceFromSeriesDataOption(typedArray);
            list.initData({
                count: function () {
                    return typedArray.length / 2;
                },
                getItem: function (idx: number) {
                    return [typedArray[idx * 2], typedArray[idx * 2 + 1]];
                },
                getSource: function () {
                    return source;
                }
            });
            expect(list.mapArray(['x', 'y'], function (x, y) {
                return [x, y];
            })).toEqual([[10, 10], [20, 20]]);
            expect(list.getRawDataItem(0)).toEqual([10, 10]);
            expect(list.getItemModel(0).option).toEqual([10, 10]);
        });
    });

    describe('Data read', function () {
        it('indicesOfNearest', function () {
            const list = new List(['value'], new Model());
            // ---- index: 0   1   2   3   4   5   6   7
            list.initData([10, 20, 30, 35, 40, 40, 35, 50]);

            expect(list.indicesOfNearest('value', 24.5)).toEqual([1]);
            expect(list.indicesOfNearest('value', 25)).toEqual([1]);
            expect(list.indicesOfNearest('value', 25.5)).toEqual([2]);
            expect(list.indicesOfNearest('value', 25.5)).toEqual([2]);
            expect(list.indicesOfNearest('value', 41)).toEqual([4, 5]);
            expect(list.indicesOfNearest('value', 39)).toEqual([4, 5]);
            expect(list.indicesOfNearest('value', 41)).toEqual([4, 5]);
            expect(list.indicesOfNearest('value', 36)).toEqual([3, 6]);

            expect(list.indicesOfNearest('value', 50.6, 0.5)).toEqual([]);
            expect(list.indicesOfNearest('value', 50.5, 0.5)).toEqual([7]);
        });
    });
});