(function ($) {
  'use strict';

  $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

  async function getData() {
    return fetch("/api/data")
      .then(res => res.json())
      .catch(err => console.error(err));
  }

  // export function renderTable(fileId) {
  //   $("")
  // }

  let fileId = null;
  let db = null;

  async function loadData() {
    db = await getData();
    if (db && db.data && db.data.length > 0) {
      $("#databaza-container").show();
      $("#databaza-loading").hide();
      $("#databaza-no-data").hide();
      $('#select-file').removeClass("d-none");
      $('#vyhovuje').removeClass("d-none");
      $('#nevyhovuje').removeClass("d-none");
      const select = $("#select-file");
      select.on("change", e => {
        fileId = e.target.value;
        const data = db.data.find(d => d._id === fileId);
        console.log("Data:", data);
        renderTable(data);
      });
      db.data.forEach(data => {
        console.log(data._id);
        const option = `<option value=${data._id}>${data.name}</option>`;

        select.append(option);
      });
      select.selectpicker();
    } else {
      $("#databaza-container").hide();
      $("#databaza-loading").hide();
      $("#databaza-no-data").show();
    }
    return db;
  }

  async function renderTable(data) {
    if (data && data._id) {
      $("#tabulka").show();
      const tbody = $("#tabulka > tbody");

      Object.values(data.data).forEach(row => {
        const html = `
        <tr>
          ${Object.values(row).map(val => `<td>${val}</td>`)}
        </tr>
      `;
        tbody.append(html);
      });
    } else {
      $("#tabulka").hide();
      return false;
    }
  }

  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function initMainGraf(loadedData) {
    window.chartModel = {};
    window.uploadedData = {};

    $("#save-btn").click(function() {
      $("#myChart")
        .get(0)
        .toBlob(function(blob) {
          var subor = $('input[name="subor"]').val();
          saveAs(blob, subor + ".png");
        });
    });

    $('input[type="file"]').change(function(e) {
      var fileName = e.target.files[0].name;
      alert('Bol vybratý "' + fileName + '" súbor.');
    });

    // Global option
    Chart.defaults.global.defaultFontFamily = "Georgia";
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = "black";
    Chart.defaults.global.defaultFontStyle = "normal";
    Chart.defaults.global.responsive = true;

    var ctx = document.getElementById("myChart").getContext("2d");
    window.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        title: {
          display: false,
          text: "Analýza technologických dát o procese skujňovania",
          fontSize: 25,
          fontColor: "blue",
          fontStyle: "bold",
          padding: 5,
        },

        legend: {
          position: "top",
          display: true,
          fontStyle: "bold",
        },

        layout: {
          padding: {
            left: 20,
            top: 20,
            left: 0,
            bottom: 0,
          },
        },

        scales: {
          yAxes: [
            {
              gridLines: {
                display: true,
                color: "black",
                borderDash: [2],
              },
              ticks: {
                beginAtZero: true,
              },
              scaleLabel: {
                display: true,
                labelString: "Hodnoty",
                fontColor: "black",
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: true,
                color: "black",
                borderDash: [2],
              },
              scaleLabel: {
                display: true,
                labelString: "Čas (s)",
                fontColor: "black",
              },
              ticks: {
                beginAtZero: true,
                min: 0
              },
            },
          ],
        },
        pan: {
          enabled: true,
          mode: "xy",
        },

        zoom: {
          enabled: true,
          mode: "xy",
        },
      },
    });
  }

  function renderChart(chartModel) {
    window.chart.options.legend.display = true;
    window.chart.options.title.display = true;
    window.chart.data.datasets = [];
    window.chart.data.labels = [];

    let maxLength = 0;
    for (let col in chartModel) {
      window.chart.data.datasets.push({
        data: chartModel[col].data,
        label: chartModel[col].label,
        fill: false,
        backgroundColor: "transparent",
        borderColor: chartModel[col].borderColor,
        borderWidth: 1,
      });

      if (maxLength < chartModel[col].data.length) maxLength = chartModel[col].data.length;
    }

    for (let i = 0; i < maxLength; i++) {
      window.chart.data.labels.push(i);
    }

    window.chart.update();
  }

  $("#databaza-container").hide();
  $("#databaza-loading").show();
  $("#databaza-no-data").hide();

  let data = null;

  async function setup() {
    const loadedData = await loadData();

    $("#select-file").on("change", event => {
      const id = event.target.value;
      data = loadedData.data.find(d => d._id === id);
      // initMainGraf(data);
      $('#file-status').removeClass("d-none");
      document.getElementById("file-status").innerHTML = `Status: ${data.status}`;

      $('#vkladanie').removeClass("d-none");
      $('#vkladanie').addClass("div-css");
      $('#vkladanie').find(".selectpicker").empty();

      if (data.data && data.data[0]) {
        // Pridanie stĺpcov do dropdownu
        const columns = Object.keys(data.data[0]);
        for (let i = 0; i < columns.length; i++) {
          const option = "<option>" + columns[i] + "</option>";
          $('#vkladanie').find(".selectpicker").append(option);
        }

        let newVkladanie = $('#vkladanie').clone();
        newVkladanie.find(".selectpicker").selectpicker();
        newVkladanie
                .find("button[role='button']")
                .last()
                .remove();
        $("#vkladanie-container").empty();
        $("#vkladanie-container").append(newVkladanie);

        window.fileName = data.name;
        window.vkladanie = newVkladanie;

         // Pridanie do grafu
        window.dataObject = {};
        for (let i = 0; i < loadedData.data.length; i++) {
          let row = data.data[i]; // Uloženie jedného riadku do premennej row, riadok má tvar objektu
          for (let key in row) {
            if (!dataObject[key]){
            dataObject[key] = [];
            }
            dataObject[key].push(parseFloat(row[key]));
          }
        }
        window.uploadedData[fileName] = dataObject;

        vkladanie.find('#add-to-chart').click(function(){
          let stlpcestring = $("#" + newVkladanie.attr("id")).find(".btn.dropdown-toggle.btn-light").attr("title");
          let stlpce = stlpcestring.split(", ");

          for (let i = 0; i < stlpce.length; i++){
            window.chartModel[fileName + "_" + stlpce[i]] = {
              data: window.uploadedData[fileName][stlpce[i]],
              label: fileName + "_" + stlpce[i],
              borderColor: getRandomColor()
            };
          }
          renderChart(chartModel);
        });

        }
      });
    initMainGraf();
    renderChart(chartModel);
  }

  setup();

}($));