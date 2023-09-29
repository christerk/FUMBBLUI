<template>
    <PageHeader id="page-header">
        <template #pagename>WinRater</template>
        <template #center>
            <div>
                <div class="description">
                    <div class="description-section">
                        <p>
                            With the WinRater you can visualize the win ratio development for fumbbl
                            coaches. To start simply enter the coach name into the search box and
                            hit the add button. You can load the data for several coaches
                            simultaneously and compare their development.
                        </p>
                        <p>
                            Currently the horizontal position of data points is only based on the
                            number of games in the given dataset and not on the time when the games
                            were played.
                        </p>
                        <p>
                            For each coach multiple graph configs can be added. In each of these
                            configs you can filter games be the different divisions. A config is
                            assigned a random color which can be changed with the color picker in
                            the config header. With the orange edit button on a config a panel opens
                            allowing you to further customize the data set.
                        </p>
                    </div>
                    <div class="description-section">
                        <p>
                            You can reduce the size of the data set by either count (i.e. first 100
                            games, games 75 - 157 etc.), a range of match ids or certain
                            dates. This filter is applied after the division filter.
                        </p>
                        <p>In addition you can choose between two aggregation modes:</p>
                        <ul>
                            <li>
                                Sum: Default mode, the win ratio will be summed up showing the total
                                win ratio up until the specific match
                            </li>
                            <li>
                                Sliding window: Instead of a sum this shows the win ratio for all
                                sets of
                                <i>n</i> consecutive games
                            </li>
                        </ul>
                        <p>
                            To open a specific match in your browser you can click the dot over data
                            point in the graph (the tooltip itself is not clickable due to technical
                            issues with tippy.js)
                        </p>
                    </div>
                </div>
            </div>
        </template>
    </PageHeader>
</template>

<script setup lang="ts">
import {PageHeader} from '@components/fumbblcomponents'

</script>

<style scoped>
@import './descriptionHeader.less';
</style>
