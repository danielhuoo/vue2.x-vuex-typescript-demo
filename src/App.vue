<template>
    <div id="app">
        <el-row>
            <el-col :span="12">
				<boyComp class="boy"></boyComp>
			</el-col>
            <el-col :span="12">
				<girlComp class='girl'></girlComp>
			</el-col>
        </el-row>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import boyComp from "./components/boy.vue";
import girlComp from "./components/girl.vue";
@Component({
    components: {
        boyComp,
        girlComp
    }
})
export default class App extends Vue {}
</script>

<style>
*{
	margin: 0;
	padding: 0
}
html,
body,
#app,
.el-row,
.el-col,
.boy,
.girl {
    height: 100%;
	color:white;
	font-size: 40px;
	text-align: center
}

.boy{
	background: #409EFF
}

.girl{
	background: #F56C6C
}
</style>