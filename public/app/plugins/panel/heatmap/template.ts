export default `
<div class="heatmap-wrapper">
	<div class="heatmap-canvas-wrapper">

		<div class="datapoints-warning" ng-if="ctrl.dataWarning">
			<span class="small" bs-tooltip="ctrl.dataWarning.tip">{{ctrl.dataWarning.title}}</span>
		</div>

		<div class="heatmap-panel" ng-dblclick="ctrl.zoomOut()"></div>
	</div>
	<div class="heatmap-legend-wrapper" ng-if="ctrl.panel.legend.show">
		<heatmap-legend></heatmap-legend>
	</div>
</div>
<div class="clearfix"></div>
`;
