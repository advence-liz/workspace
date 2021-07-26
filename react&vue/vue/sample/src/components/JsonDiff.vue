<template>
  <table>
    <tr>
      <th>before</th>
      <th>current</th>
      <th>diff</th>
    </tr>
    <tr>
      <td contenteditable="true" v-text="pre"></td>
      <td contenteditable="true" id="current" v-text="current"></td>
      <td><pre ref="diffView" class="diff-view"></pre></td>
    </tr>
  </table>
</template>

<script>
const JsDiff = require('diff')
export default {
  name: 'josn-diff',
  data() {
    return {
      pre: JSON.stringify({ liz: 'eee', name: 'cc' }, null, 2),
      current: JSON.stringify({ liz: 'eee', name: 'c' }, null, 2)
    }
  },
  mounted() {
    this.refreshDiffView()
  },
  methods: {
    refreshDiffView() {
      var diff = JsDiff.diffLines(this.pre, this.current)
      var fragment = document.createDocumentFragment()
      for (var i = 0; i < diff.length; i++) {
        if (diff[i].added && diff[i + 1] && diff[i + 1].removed) {
          var swap = diff[i]
          diff[i] = diff[i + 1]
          diff[i + 1] = swap
        }

        var node
        if (diff[i].removed) {
          node = document.createElement('del')
          node.classList.add('del')
          node.appendChild(document.createTextNode(diff[i].value))
        } else if (diff[i].added) {
          node = document.createElement('ins')
          node.classList.add('ins')

          node.appendChild(document.createTextNode(diff[i].value))
        } else {
          node = document.createTextNode(diff[i].value)
        }
        fragment.appendChild(node)
      }

      this.$refs.diffView.textContent = ''
      this.$refs.diffView.appendChild(fragment)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.del {
  text-decoration: none;
  color: #b30000;
  background: #fadad7;
}
.ins {
  background: #eaf2c2;
  color: #406619;
  text-decoration: none;
}
.diff-view {
  white-space: pre-wrap;
  table-layout: fixed;
  width: 100%;
  margin: 0;
}
table {
  table-layout: fixed;
  width: 100%;
}
th {
  text-align: left;
}
td {
  width: 33%;
  padding: 3px 4px;
  border: 1px solid transparent;
  vertical-align: top;
  font: 1em monospace;
  text-align: left;
  white-space: pre-wrap;
}
</style>
