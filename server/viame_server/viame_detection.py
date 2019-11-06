import csv
import re

from girder.api import access
from girder.api.describe import Description, autoDescribeRoute
from girder.api.rest import Resource
from girder.models.item import Item
from girder.models.file import File


class ViameDetection(Resource):
    def __init__(self):
        super(ViameDetection, self).__init__()
        self.resourceName = 'viame_detection'
        self.route("GET", (), self.get_detection_result)
        self.route("GET", ('clip_meta',), self.get_clip_meta)

    @access.user
    @autoDescribeRoute(
        Description("Run viame pipeline")
        .param("itemId", "Item ID for a video")
        .param("pipeline", "Pipeline to run against the video", default="detector_simple_hough.pipe")
    )
    def get_detection_result(self, itemId, pipeline):
        item = Item().findOne({
            "meta.itemId": itemId,
            "meta.pipeline": pipeline
        })
        file = Item().childFiles(item)[0]
        rows = b''.join(list(File().download(file, headers=False)())).decode("utf-8").split('\n')
        reader = csv.reader(row for row in rows if (not row.startswith('#') and row))
        detections = []
        for row in reader:
            confidence_pairs = []
            features = {}
            for i in [i for i in range(9, len(row)) if i % 2 != 0]:
                if row[i].startswith('+'):
                    break
                confidence_pairs.append([row[i], float(row[i+1])])
            for j in range(i, len(row)):
                if 'head' in row[j]:
                    groups = re.match(r'\+kp head ([0-9]+) ([0-9]+)', row[j])
                    if groups:
                        features['head'] = (groups[1], groups[2])
                elif 'tail' in row[j]:
                    groups = re.match(r'\+kp tail ([0-9]+) ([0-9]+)', row[j])
                    if groups:
                        features['tail'] = (groups[1], groups[2])
            detections.append({
                'track': int(row[0]),
                'frame': int(row[2]),
                'bounds': [float(row[3]), float(row[5]), float(row[4]), float(row[6])],
                'confidencePairs': confidence_pairs,
                'features': features
            })
        return detections

    @access.user
    @autoDescribeRoute(
        Description("")
        .param("itemId", "Item ID for a video")
        .param("pipeline", "Pipeline to run against the video", default="detector_simple_hough.pipe")
    )
    def get_clip_meta(self, itemId, pipeline):
        detections = list(Item().find({
            "meta.itemId": itemId,
            "meta.pipeline": pipeline
        }).sort([("created", -1)]))
        detection = None
        if len(detections):
            detection = detections[0]
        video = Item().findOne({
            "meta.itemId": itemId,
            "meta.codec": 'h264'
        })
        return {
            'detection': detection,
            'video': video
        }