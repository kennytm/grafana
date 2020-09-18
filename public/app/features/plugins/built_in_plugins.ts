import * as textPanel from 'app/plugins/panel/text/module';
import * as graph2Panel from 'app/plugins/panel/graph2/module';
import * as graphPanel from 'app/plugins/panel/graph/module';
import * as dashListPanel from 'app/plugins/panel/dashlist/module';
import * as pluginsListPanel from 'app/plugins/panel/pluginlist/module';
import * as alertListPanel from 'app/plugins/panel/alertlist/module';
import * as annoListPanel from 'app/plugins/panel/annolist/module';
import * as heatmapPanel from 'app/plugins/panel/heatmap/module';
import * as tablePanel from 'app/plugins/panel/table/module';
import * as oldTablePanel from 'app/plugins/panel/table-old/module';
import * as singlestatPanel from 'app/plugins/panel/singlestat/module';
import * as singlestatPanel2 from 'app/plugins/panel/stat/module';
import * as gettingStartedPanel from 'app/plugins/panel/gettingstarted/module';
import * as gaugePanel from 'app/plugins/panel/gauge/module';
import * as pieChartPanel from 'app/plugins/panel/piechart/module';
import * as barGaugePanel from 'app/plugins/panel/bargauge/module';
import * as logsPanel from 'app/plugins/panel/logs/module';
import * as newsPanel from 'app/plugins/panel/news/module';
import * as homeLinksPanel from 'app/plugins/panel/homelinks/module';
import * as welcomeBanner from 'app/plugins/panel/welcome/module';

const builtInPlugins: any = {
  'app/plugins/panel/text/module': textPanel,
  'app/plugins/panel/graph2/module': graph2Panel,
  'app/plugins/panel/graph/module': graphPanel,
  'app/plugins/panel/dashlist/module': dashListPanel,
  'app/plugins/panel/pluginlist/module': pluginsListPanel,
  'app/plugins/panel/alertlist/module': alertListPanel,
  'app/plugins/panel/annolist/module': annoListPanel,
  'app/plugins/panel/heatmap/module': heatmapPanel,
  'app/plugins/panel/table/module': tablePanel,
  'app/plugins/panel/table-old/module': oldTablePanel,
  'app/plugins/panel/news/module': newsPanel,
  'app/plugins/panel/singlestat/module': singlestatPanel,
  'app/plugins/panel/stat/module': singlestatPanel2,
  'app/plugins/panel/gettingstarted/module': gettingStartedPanel,
  'app/plugins/panel/gauge/module': gaugePanel,
  'app/plugins/panel/piechart/module': pieChartPanel,
  'app/plugins/panel/bargauge/module': barGaugePanel,
  'app/plugins/panel/logs/module': logsPanel,
  'app/plugins/panel/homelinks/module': homeLinksPanel,
  'app/plugins/panel/welcome/module': welcomeBanner,
};

export default builtInPlugins;
