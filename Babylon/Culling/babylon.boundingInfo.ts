﻿module BABYLON {
    var computeBoxExtents = (axis: Vector3, box: BoundingBox) => {
        var p = Vector3.Dot(box.center, axis);

        var r0 = Math.abs(Vector3.Dot(box.directions[0], axis)) * box.extends.x;
        var r1 = Math.abs(Vector3.Dot(box.directions[1], axis)) * box.extends.y;
        var r2 = Math.abs(Vector3.Dot(box.directions[2], axis)) * box.extends.z;

        var r = r0 + r1 + r2;
        return {
            min: p - r,
            max: p + r
        };
    }

    var extentsOverlap = (min0: number, max0: number, min1: number, max1: number): boolean => !(min0 > max1 || min1 > max0);

    var axisOverlap = (axis: Vector3, box0: BoundingBox, box1: BoundingBox): boolean => {
        var result0 = computeBoxExtents(axis, box0);
        var result1 = computeBoxExtents(axis, box1);

        return extentsOverlap(result0.min, result0.max, result1.min, result1.max);
    }

    export class BoundingInfo {
        public boundingBox: BoundingBox;
        public boundingSphere: BoundingSphere;

        constructor(minimum: Vector3, maximum: Vector3) {
            this.boundingBox = new BABYLON.BoundingBox(minimum, maximum);
            this.boundingSphere = new BABYLON.BoundingSphere(minimum, maximum);
        }

        // Methods
        public _update(world: Matrix, scale: number = 1.0) {
            this.boundingBox._update(world);
            this.boundingSphere._update(world, scale);
        }

        public isInFrustum(frustumPlanes: Plane[]): boolean {
            if (!this.boundingSphere.isInFrustum(frustumPlanes))
                return false;

            return this.boundingBox.isInFrustum(frustumPlanes);
        }

        //ANY
        public _checkCollision(collider): boolean {
            return collider._canDoCollision(this.boundingSphere.centerWorld, this.boundingSphere.radiusWorld, this.boundingBox.minimumWorld, this.boundingBox.maximumWorld);
        }

        public intersectsPoint(point: Vector3): boolean {
            if (!this.boundingSphere.centerWorld) {
                return false;
            }

            if (!this.boundingSphere.intersectsPoint(point)) {
                return false;
            }

            if (!this.boundingBox.intersectsPoint(point)) {
                return false;
            }

            return true;
        }

        public intersects(boundingInfo: BoundingInfo, precise: boolean): boolean {
            if (!this.boundingSphere.centerWorld || !boundingInfo.boundingSphere.centerWorld) {
                return false;
            }

            if (!BABYLON.BoundingSphere.Intersects(this.boundingSphere, boundingInfo.boundingSphere)) {
                return false;
            }

            if (!BABYLON.BoundingBox.Intersects(this.boundingBox, boundingInfo.boundingBox)) {
                return false;
            }

            if (!precise) {
                return true;
            }

            var box0 = this.boundingBox;
            var box1 = boundingInfo.boundingBox;

            if (!axisOverlap(box0.directions[0], box0, box1)) return false;
            if (!axisOverlap(box0.directions[1], box0, box1)) return false;
            if (!axisOverlap(box0.directions[2], box0, box1)) return false;
            if (!axisOverlap(box1.directions[0], box0, box1)) return false;
            if (!axisOverlap(box1.directions[1], box0, box1)) return false;
            if (!axisOverlap(box1.directions[2], box0, box1)) return false;
            if (!axisOverlap(BABYLON.Vector3.Cross(box0.directions[0], box1.directions[0]), box0, box1)) return false;
            if (!axisOverlap(BABYLON.Vector3.Cross(box0.directions[0], box1.directions[1]), box0, box1)) return false;
            if (!axisOverlap(BABYLON.Vector3.Cross(box0.directions[0], box1.directions[2]), box0, box1)) return false;
            if (!axisOverlap(BABYLON.Vector3.Cross(box0.directions[1], box1.directions[0]), box0, box1)) return false;
            if (!axisOverlap(BABYLON.Vector3.Cross(box0.directions[1], box1.directions[1]), box0, box1)) return false;
            if (!axisOverlap(BABYLON.Vector3.Cross(box0.directions[1], box1.directions[2]), box0, box1)) return false;
            if (!axisOverlap(BABYLON.Vector3.Cross(box0.directions[2], box1.directions[0]), box0, box1)) return false;
            if (!axisOverlap(BABYLON.Vector3.Cross(box0.directions[2], box1.directions[1]), box0, box1)) return false;
            if (!axisOverlap(BABYLON.Vector3.Cross(box0.directions[2], box1.directions[2]), box0, box1)) return false;

            return true;
        }
    }
} 