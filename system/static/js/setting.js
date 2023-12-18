document.addEventListener('DOMContentLoaded', function() {
    const dataSelect = document.getElementById('data');
    const timeFilterStart = document.getElementById('time-filter-start');
    const timeFilterEnd = document.getElementById('time-filter-end');

    const sf_Filter = document.getElementById('sig_fil');

    dataSelect.addEventListener('change', function() {
        const value = dataSelect.querySelector("select").value;
        const timeMax = value == '4x4' ? 1350 : 450;
        var sigMax = 0
        if (value == '4x4') {
            sigMax = 16;
        } else if (value == 'ing') {
            sigMax = 20;
        } else {
            sigMax = 28;
        }
        // Populate time filter options
        timeFilterStart.innerHTML = '';
        timeFilterEnd.innerHTML = '';
        sf_Filter.innerHTML = '';
        for (let i = 1; i <= timeMax; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            timeFilterStart.appendChild(option.cloneNode(true));
            timeFilterEnd.appendChild(option);
        }

        for (let i = 0; i <= sigMax; i++) {
            const option = document.createElement('option');
            option.value = i
            option.textContent = 'Signal ' + String(i)
            sf_Filter.appendChild(option);
        }

        var shp = document.getElementById('shape_map');
        var t = shp.querySelectorAll("svg");
        t.forEach(function(svg) {
            svg.remove();
        });
        createMap(value)
        // Set default values for time filter
        timeFilterStart.value = 1;
        updateTimeFilterEndOptions(1, timeMax);
        draw(value)
    });

    timeFilterStart.addEventListener('change', function() {
        const startValue = parseInt(timeFilterStart.value, 10);
        const dataValue = dataSelect.querySelector("select").value;
        const timeMax = dataValue == '4x4' ? 1350 : 450;
        updateTimeFilterEndOptions(startValue, timeMax);
    });

    function updateTimeFilterEndOptions(startValue, max) {
        timeFilterEnd.innerHTML = '';
        for (let i = startValue; i <= max; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            timeFilterEnd.appendChild(option);
        }
        timeFilterEnd.value = startValue + 1;
    }

    // Trigger the change event to populate initial options
    dataSelect.dispatchEvent(new Event('change'));
});

function addOption() {
    const select = document.getElementById('sig_fil');
    const selectedOption = select.options[select.selectedIndex].text;
    const optionsContainer = document.getElementById('selected_sig');
    const optionDiv = document.createElement('div');
    optionDiv.className = 'selected'
    optionDiv.textContent = selectedOption;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.className = 'rbtn';
    removeBtn.onclick = function() {
        optionsContainer.removeChild(optionDiv);
    };
    optionDiv.appendChild(removeBtn);
    optionsContainer.appendChild(optionDiv);
}